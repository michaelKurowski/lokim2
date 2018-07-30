const CODES = {
    JOIN_ROOM: 'JOIN_ROOM',
    SELECT_ROOM: 'SELECT_ROOM',
    LEAVE_ROOM: 'LEAVE_ROOM',
    CREATE_ROOM: 'CREATE_ROOM'
}

const actions = {
    joinRoom: roomId => ({type: CODES.JOIN_ROOM, payload: {roomId}}),
    createRoom: invitedUsers => ({type: CODES.CREATE_ROOM, payload: {invitedUsers}}),
    selectRoom: roomId => ({type: CODES.SELECT_ROOM, payload: {roomId}}),
    leaveRoom: roomId => ({type: CODES.LEAVE_ROOM, payload: {roomId}})
}

module.exports = {CODES, actions}