const CODES = {
    ADD_MESSAGE: 'RECEIVE_MESSAGE',
    ADD_MEMBER: 'ADD_MEMBER',
    SEND_MESSAGE: 'SEND_MESSAGE'
}

const actions = {
    addMessage: message => ({type: CODES.ADD_MESSAGE, payload: {message}}),
    addMember: username => ({type: CODES.ADD_MEMBER, payload: {username}}),
    sendMessage: message => ({type: CODES.SEND_MESSAGE, payload: {message}})
}

module.exports = {CODES, actions}