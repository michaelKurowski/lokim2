const _ = require('lodash')

const CODES = {
    ROOM: {
        CONNECTED: 'ROOM_CONNECTED',
        MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
        USER_JOINED: 'USER_JOINED',
        MEMBERS_LISTED: 'MEMBERS_LISTED'
    },
    USERS: {
        CONNECTED: 'USERS_CONNECTED',
        USERS_FOUND: 'USERS_FOUND'
    }
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
    }
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