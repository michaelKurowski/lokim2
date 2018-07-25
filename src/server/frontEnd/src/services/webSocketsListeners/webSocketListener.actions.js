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

const webSocketProvider = require('../../utils/sockets/ws-routing')

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

function messageReceived(message) {
    return {type: CODES.ROOM.MESSAGE_RECEIVED, payload: message}
}

function userJoined(username) {
    return {type: CODES.ROOM.USER_JOINED, payload: username}
}

function membersListed(usernames, roomId) {
    return {type: CODES.ROOM.MEMBERS_LISTED, payload: {usernames, roomId}}
}

function usersConnected() {
    return {type: CODES.USERS.CONNECTED, payload: {}}
}

function usersFound(usernames) {
    return {type: CODES.USERS.USERS_FOUND, payload: usernames}
}



module.exports = {CODES, actions}