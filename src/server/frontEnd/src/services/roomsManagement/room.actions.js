const CODES = {
    ADD_MESSAGE: 'ADD_MESSAGE',
    ADD_MEMBER: 'ADD_MEMBER',
    SEND_MESSAGE: 'SEND_MESSAGE',
    SET_MEMBERS: 'SET_MEMBERS'
}

const actions = {
    addMessage: (message, roomId) => ({type: CODES.ADD_MESSAGE, payload: {message, roomId}}),
    setMembers: (members, roomId) => ({type: CODES.SET_MEMBERS, payload: {members, roomId}}),
    addMember: (username, roomId) => ({type: CODES.ADD_MEMBER, payload: {username, roomId}}),
    sendMessage: (message, roomId) => ({type: CODES.SEND_MESSAGE, payload: {message}})
}

module.exports = {CODES, actions}