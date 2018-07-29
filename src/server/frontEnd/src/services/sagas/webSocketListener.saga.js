const {takeEvery, put, call} = require('redux-saga/effects')
const {eventChannel} = require('redux-saga')
const WEBSOCKET_EVENTS = require('../webSocket/webSocket.actions').CODES
const webSocketActions = require('../webSocket/webSocket.actions').actions
const PROTOCOL = require('../../../../protocol/protocol.json')
const roomActions = require('../roomsManagement/room.actions').actions
const webSocketProvider = require('../../utils/sockets/ws-routing')
const serverProvidedProtocols = require('../../../../protocol/protocol.json')

function webSocketIncommingTrafficChannel() {
    return eventChannel(emitter => {
        const socket = webSocketProvider.create()
        setupWebSocketListeners(socket, emitter, serverProvidedProtocols)
        return () => socket.close()
    })
}

function setupWebSocketListeners(socket, emitter, protocol) {
    
    _.forEach(protocol, namespace => {
        socket[namespace.name].on('connect', () => 
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
    console.log('Emitter', event.type, event)
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
            yield put(roomActions.addMember(event.payload.username, event.payload.roomId))
            break
        case PROTOCOL.users.eventTypes.FIND:
            return
        default:
            return
    }
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