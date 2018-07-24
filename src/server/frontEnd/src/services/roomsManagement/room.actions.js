const CODES = {
    ADD_MESSAGE: 'RECEIVE_MESSAGE',
    ADD_MEMBER: 'ADD_MEMBER',
    SEND_MESSAGE: 'SEND_MESSAGE'
}

const actions = {
    addMessage: (message, roomId) => ({type: CODES.ADD_MESSAGE, payload: {message, roomId}}),
    addMember: (username, roomId) => ({type: CODES.ADD_MEMBER, payload: {username, roomId}}),
    sendMessage: message => ({type: CODES.SEND_MESSAGE, payload: {message}})
}

module.exports = {CODES, actions}