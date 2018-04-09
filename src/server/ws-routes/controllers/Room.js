const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const SERVER_EVENTS = namespaceInfo.serverEventTypes

class Room {
	static connection(socket, connections) {
		const username = socket.request.user.username
		const roomId = uuidv4()
		connections.usersToConnectionsMap.set(username, socket)
		Room.join({roomId}, socket, connections)
	}

	static join(data, socket, connections) {
		const {roomId} = data
		const username = socket.request.user.username
		socket.emit(SERVER_EVENTS.JOINED, {username, roomId})
		socket.join(roomId)
	}

	static message(data, socket, connections) {
		const {roomId, message} = data
		socket.to(roomId).emit(SERVER_EVENTS.MESSAGE, message)
	}

	static leave(data, socket, connections) {
		const {roomId} = data
		socket.to(roomId).emit(SERVER_EVENTS.LEFT, {username: socket.request.user.username})
		socket.leave({roomId})
	}

	static create(data, socket, connections) {
		const {invitedUsersIndexes} = data
		const roomId = uuidv4()

		Room.join({roomId}, socket, connections)
		joinUsersToRoom(invitedUsersIndexes, roomId, connections)
	}
}

function joinUsersToRoom(invitedUsersIndexes, roomId, connections) {
	_.forEach(invitedUsersIndexes, username => {
		const invitedUserSocket = connections.usersToConnectionsMap.get(username)
		if (invitedUserSocket) Room.join({roomId}, invitedUserSocket, connections)
	})
}

module.exports = Room