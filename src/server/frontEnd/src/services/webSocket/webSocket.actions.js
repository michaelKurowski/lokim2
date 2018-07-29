const _ = require('lodash')

const CODES = {
    ROOM: {
        CONNECTED: 'WEBSOCKET_MESSAGE_ROOM_CONNECTED',
        MESSAGE_RECEIVED: 'WEBSOCKET_MESSAGE_MESSAGE_RECEIVED',
        USER_JOINED: 'WEBSOCKET_MESSAGE_USER_JOINED',
        MEMBERS_LISTED: 'WEBSOCKET_MESSAGE_MEMBERS_LISTED'
    },
    USERS: {
        CONNECTED: 'WEBSOCKET_MESSAGE_USERS_CONNECTED',
        USERS_FOUND: 'WEBSOCKET_MESSAGE_USERS_FOUND'
    },
    WEBSOCKET_EVENT: 'WEBSOCKET_EVENT',
    WEBSOCKET_CONNECTION_REQUEST: 'WEBSOCKET_CONNECTION_REQUEST',
    WEBSOCKET_CONNECTION_ESTABILISHED: 'WEBSOCKET_CONNECTION_ESTABILISHED'
}

const actions = {
    room: {
        connected: roomConnected,
        messageReceived,
        userJoined,
        membersListed
    },
    users: {
        connected: usersConnected,
        usersFound
    },
    webSocketEvent,
    webSocketConnectionRequest,
    webSocketConnectionEstabilished
}

function webSocketConnectionEstabilished(namespace) {
    return {type: CODES.WEBSOCKET_CONNECTION_ESTABILISHED, payload: {namespace}}
}

function webSocketConnectionRequest() {
    return {type: CODES.WEBSOCKET_CONNECTION_REQUEST, payload: {}}
}

function webSocketEvent({event, type}) {
    return {type: CODES.WEBSOCKET_EVENT, payload: {event, type}}
}

function roomConnected() {
    return {type: CODES.ROOM.CONNECTED, payload: {}}
}

function messageReceived(event) {
    return {type: CODES.ROOM.MESSAGE_RECEIVED, payload: event}
}

function userJoined(event) {
    return {type: CODES.ROOM.USER_JOINED, payload: event}
}

function membersListed(event) {
    return {type: CODES.ROOM.MEMBERS_LISTED, payload: event}
}

function usersConnected(event) {
    return {type: CODES.USERS.CONNECTED, payload: event}
}

function usersFound(event) {
    return {type: CODES.USERS.USERS_FOUND, payload: event}
}



module.exports = {CODES, actions}