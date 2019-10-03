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

const handleActions = (state = initialState, action = {}) => {
	switch (action.type) {
		case ACTION_CODES.ADD_MEMBER:
			return addMember(state, action.payload)
		case ACTION_CODES.SELECT_ROOM: 
			return selectRoom(state, action.payload)
		case ACTION_CODES.ADD_MESSAGE: 
			return addMessage(state, action.payload)
		case ACTION_CODES.SET_MEMBERS:
			return setMembers(state, action.payload)
		default:
			return state
	}
}

function selectRoom(state, payload) {
	return Object.assign({}, state, {selectedRoom: payload.roomId})
}

function addMessage(state, payload) {
	const newMessage = payload.message

	const currentRooms = state.rooms
	const currentRoom = currentRooms[payload.roomId] || roomSchema
	const currentMessages = currentRoom.messages

	const newMessages = [...currentMessages, newMessage]
	const newRoom = Object.assign({}, currentRoom, {messages: newMessages})
	const newRooms = Object.assign({}, currentRooms, {[payload.roomId]: newRoom})

	return Object.assign({}, state, {rooms: newRooms})
}

function addMember(state, payload) {
	const newMember = payload.username

	const currentRooms = state.rooms
	const currentRoom = currentRooms[payload.roomId] || roomSchema
	const currentMembers = currentRoom.members

	const newMembers = [...currentMembers, newMember]
	const newRoom = Object.assign({}, currentRoom, {members: newMembers})
	const newRooms = Object.assign({}, currentRooms, {[payload.roomId]: newRoom})

	return Object.assign({}, state, {rooms: newRooms})
}

function setMembers(state, payload) {
	const currentRooms = state.rooms
	const currentRoom = currentRooms[payload.roomId] || roomSchema
	const newMembers = payload.members
	const newRoom = Object.assign({}, currentRoom, {members: newMembers})
	const newRooms = Object.assign({}, currentRooms, {[payload.roomId]: newRoom})

	return Object.assign({}, state, {rooms: newRooms})  
}

module.exports = handleActions