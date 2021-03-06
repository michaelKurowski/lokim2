const {takeEvery, call, takeLatest} = require('redux-saga/effects')
const WEBSOCKET_EVENTS = require('../webSocket/webSocket.actions').CODES
const ROOM_ACTION_CODES = require('../roomsManagement/room.actions').CODES
const ROOM_MANAGEMENT_CODES = require('../roomsManagement/roomsManagement.actions').CODES
const SESSION_ACTION_CODES = require('../session/session.actions').CODES
const FIND_USERS_ACTION_CODES = require('../findUsers/findUsers.actions').CODES
const protocols = require('../../utils/io-protocol.json')
const webSocketProvider = require('services/webSocket/webSocketProvider')

function* watch() {
	yield takeLatest(WEBSOCKET_EVENTS.WEBSOCKET_CONNECTION_ESTABILISHED, watchSendMessage)
}

function* watchSendMessage() {
	yield takeEvery(ROOM_ACTION_CODES.SEND_MESSAGE, sendMessage)
	yield takeEvery(ROOM_MANAGEMENT_CODES.JOIN_ROOM, joinRoom)
	yield takeEvery(ROOM_MANAGEMENT_CODES.CREATE_ROOM, createRoom)
	yield takeEvery(ROOM_MANAGEMENT_CODES.LEAVE_ROOM, leaveRoom)
	yield takeEvery(SESSION_ACTION_CODES.LOG_OUT, logOut)
	yield takeEvery(FIND_USERS_ACTION_CODES.FIND_USER, findUsersByUsername)
}

function* findUsersByUsername(action) {
	const socket = webSocketProvider.get()
	yield call(emitFindUsersByUsername, socket, action.payload.username)
}

function* logOut() {
	const socket = webSocketProvider.get()
	yield call(closeSocket, socket)
}

function* createRoom(action) {
	const socket = webSocketProvider.get()
	yield call(emitCreateRoom, socket, action.payload)
}

function* joinRoom(action) {
	const socket = webSocketProvider.get()
	yield call(emitJoinRoom, socket, action.payload)
}

function* leaveRoom(action) {
	const socket = webSocketProvider.get()
	yield call(emitLeaveRoom, socket, action.payload)
}

function* sendMessage(action) {
	const socket = webSocketProvider.get()
	yield call(emitMessage, socket, action.payload.messageObject)
}

function emitCreateRoom(socket, eventObject) {
	socket.room.emit(protocols.CREATE, {invitedUsersIndexes: eventObject.invitedUsers})
}

function emitJoinRoom(socket, eventObject) {
	socket.room.emit(protocols.JOIN, eventObject)
}

function emitFindUsersByUsername(socket, username) {
	socket.users.emit(protocols.FIND, {queryPhrase: username})
}

function emitMessage(socket, eventObject) {
	socket.room.emit(protocols.MESSAGE, eventObject)
}

function emitLeaveRoom(socket, eventObject) {
	socket.room.emit(protocols.LEAVE, eventObject)
}

function closeSocket(socket) {
	socket.room.close()
	socket.users.close()
}

module.exports = {
	watch
}