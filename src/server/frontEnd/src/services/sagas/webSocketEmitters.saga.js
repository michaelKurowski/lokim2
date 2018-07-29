const {takeEvery, call, takeLatest} = require('redux-saga/effects')
const WEBSOCKET_EVENTS = require('../webSocket/webSocket.actions').CODES
const ROOM_ACTION_CODES = require('../roomsManagement/room.actions').CODES
const protocols = require('../../utils/io-protocol.json')
const webSocketProvider = require('../../utils/sockets/ws-routing')

function* watch() {
    yield takeLatest(WEBSOCKET_EVENTS.WEBSOCKET_CONNECTION_ESTABILISHED, watchSendMessage)
}

function* watchSendMessage() {
    yield takeEvery(ROOM_ACTION_CODES.SEND_MESSAGE, sendMessage)
}

function* sendMessage(action) {
    const socket = webSocketProvider.get()
    yield call(emitMessage, socket, action.payload.messageObject)
}

function emitMessage(socket, messageObject) {
    socket.room.emit(protocols.MESSAGE, messageObject)
}

module.exports = {
    watch
}