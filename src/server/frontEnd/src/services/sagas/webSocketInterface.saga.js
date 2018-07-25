const {takeEvery, put} = require('redux-saga/effects')
const WEBSOCKET_EVENTS = require('../webSocketsListeners/webSocketListener.actions').CODES

const roomActions = require('../roomsManagement/room.actions').actions

function* watch() {
    yield takeEvery([...Object.values(WEBSOCKET_EVENTS.ROOM), ...Object.values(WEBSOCKET_EVENTS.USERS)], mapWebsocketEventsToActions)
}

function* mapWebsocketEventsToActions(action) {
    switch (action.type) {
        case WEBSOCKET_EVENTS.ROOM.CONNECTED:
            return
        case WEBSOCKET_EVENTS.ROOM.MEMBERS_LISTED:
            yield put(roomActions.setMembers(action.payload.usernames, action.payload.roomId))
            break
        case WEBSOCKET_EVENTS.ROOM.MESSAGE_RECEIVED:
            yield put(roomActions.addMessage(action.payload, action.payload.roomId))
            break
        case WEBSOCKET_EVENTS.ROOM.USER_JOINED:
            yield put(roomActions.addMember(action.payload.username, action.payload.roomId))
            break
        case WEBSOCKET_EVENTS.USERS.CONNECTED:
            return
        case WEBSOCKET_EVENTS.USERS.USERS_FOUND:
            return
        default:
            return
    }
}

function setRoomMembers(event) {
    
}

function mapMembersListed() {

}

module.exports = {
    watch
}