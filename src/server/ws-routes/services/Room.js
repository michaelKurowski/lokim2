const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const SERVER_EVENTS = namespaceInfo.serverEventTypes

class Room {
	static connection(socket, connections) {
		const userId = socket.request.user.username
		const roomId = uuidv4()
		connections.usersToConnectionsMap.set(userId, socket)
		Room.join({roomId}, socket, connections)
	}

	static join(data, socket, connections) {
		const {roomId} = data
		const userId = socket.request.user.username
		socket.emit(SERVER_EVENTS.JOINED, {userId, roomId})
		socket.join(roomId)
	}

	static message(data, socket, connections) {
		const {roomId, message} = data
		socket.to(roomId).emit(SERVER_EVENTS.MESSAGE, message)
	}

	static leave(data, socket, connections) {
		const {roomId} = data
		socket.leave(roomId)
		socket.emit(SERVER_EVENTS.LEFT, {userId: socket.request.user.username})
	}

	static create(data, socket, connections) {
		const {invitedUsersIndexes} = data
		const roomId = uuidv4()

		Room.join({roomId}, socket, connections)
		joinUsersToRoom(invitedUsersIndexes, roomId, connections)
	}
}

function joinUsersToRoom(invitedUsersIndexes, roomId, connections) {
	_.forEach(invitedUsersIndexes, userId => {
		const invitedUserSocket = connections.usersToConnectionsMap.get(userId)
		Room.join({roomId}, invitedUserSocket, connections)
	})
}

module.exports = Room