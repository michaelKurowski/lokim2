const ACTION_CODES = Object.assign(
    {},
    require('./room.actions').CODES,
    require('./roomsManagement.actions').CODES
)

const initialState = {
    selectedRoom: '',
    rooms: {}
}

const roomSchema = {
    members: [],
    roomId: '',
    messages: []
}

const messageSchema = {
    date: null,
    author: '',
    text: ''
}

const handleActions = (state = initialState, action = {}) => {
    switch (action.type) {
        case ACTION_CODES.ADD_MEMBER:
            const newMember = action.payload.username

            const currentRooms = state.rooms
            const currentRoom = currentRooms[action.payload.roomId] || roomSchema
            const currentMembers = currentRoom.members

            const newMembers = [...currentMembers, newMember]
            const newRoom = Object.assign({}, currentRoom, {members: newMembers})
            const newRooms = Object.assign({}, currentRooms, {[action.payload.roomId]: newRoom})

            return Object.assign({}, state, {rooms: newRooms})
        case ACTION_CODES.SELECT_ROOM: 
            return Object.assign({}, state, {selectedRoom: action.payload.roomId})
        default:
            return state
    }
}

module.exports = handleActions