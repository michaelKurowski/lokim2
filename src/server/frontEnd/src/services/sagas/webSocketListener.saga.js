const {takeEvery, put, call, select} = require('redux-saga/effects')
const {eventChannel} = require('redux-saga')
const WEBSOCKET_EVENTS = require('../webSocket/webSocket.actions').CODES
const webSocketActions = require('../webSocket/webSocket.actions').actions
const CLIENT_SPECIFIC_WEBSOCKET_EVENTS = require('../webSocket/clientSpecificWebSocketEvents.json')
const PROTOCOL = require('../../../../protocol/protocol.json')
const roomActions = require('../roomsManagement/room.actions').actions
const roomsManagementActions = require('../roomsManagement/roomsManagement.actions').actions
const findUserActions = require('../findUsers/findUsers.actions').actions
const webSocketProvider = require('services/webSocket/webSocketProvider')
const serverProvidedProtocols = require('../../../../protocol/protocol.json')
const _ = require('lodash')

function webSocketIncommingTrafficChannel() {
	return eventChannel(emitter => {
		const socket = webSocketProvider.create()
		setupWebSocketListeners(socket, emitter, serverProvidedProtocols)
		return () => socket.close()
	})
}

function setupWebSocketListeners(socket, emitter, protocol) {
    
	_.forEach(protocol, namespace => {
		socket[namespace.name].on(CLIENT_SPECIFIC_WEBSOCKET_EVENTS.CONNECT, () => 
			emitter(webSocketConnectionEstabilishedEvent(namespace.name)))

		_.forEach(namespace.eventTypes, eventType => {
			socket[namespace.name].on(eventType, event => 
				emitter(webSocketMessageReceivedEvent(eventType, event)))
		})
	})
}

function* watch() {
	yield takeEvery(WEBSOCKET_EVENTS.WEBSOCKET_CONNECTION_REQUEST, watchWebsocketConnectionRequest)
}

function* watchWebsocketConnectionRequest() {
	const channel = yield call(webSocketIncommingTrafficChannel)
	yield takeEvery(channel, mapWebsocketEventsToActions)
    
}

function* mapWebsocketEventsToActions(event) {
	switch (event.type) {
		case PROTOCOL.room.eventTypes.CONNECTION:
			yield put(webSocketActions.webSocketConnectionEstabilished(event.payload.namespace))
			break
		case PROTOCOL.room.eventTypes.LIST_MEMBERS:
			yield put(roomActions.setMembers(event.payload.usernames, event.payload.roomId))
			break
		case PROTOCOL.room.eventTypes.MESSAGE:
			yield put(roomActions.addMessage(event.payload, event.payload.roomId))
			break
		case PROTOCOL.room.eventTypes.JOIN:
			yield* handleJoinEvent(event)
			break
		case PROTOCOL.users.eventTypes.FIND:
			yield put(findUserActions.usersFound(event.payload.foundUsernames))
			return
		default:
			return
	}
}

function* handleJoinEvent(event) {
	const loggedUserUsername = yield select(store => store.sessionReducer.username)
	if (loggedUserUsername === event.payload.username) 
		yield put(roomsManagementActions.selectRoom(event.payload.roomId))
	yield put(roomActions.addMember(event.payload.username, event.payload.roomId))
} 

function webSocketMessageReceivedEvent(eventType, event) {
	return {type: eventType, payload: event}
}

function webSocketConnectionEstabilishedEvent(namespace) {
	return {type: PROTOCOL.room.eventTypes.CONNECTION, payload: {namespace}}
}

module.exports = {
	watch
}