const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const SERVER_EVENTS = namespaceInfo.serverEventTypes

class Room {
	static connection(socket, connections) {
		const username = socket.request.user.username
		console.log('Hi, I\'m the connection method', username || 'No user')
		const roomId = uuidv4()
		connections.usersToConnectionsMap.set(username, socket)
		Room.join({roomId}, socket, connections)
	}

	static join(data, socket, connections) {
		const {roomId} = data
		const username = socket.request.user.username
		console.log('Join Event', username, roomId)
		socket.emit(SERVER_EVENTS.JOINED, {username, roomId})
		socket.join(roomId)
	}

	static message(data, socket, connections) {
		const {roomId, message} = data
		console.log('Message Event', roomId, message)
		socket.to(roomId).emit(SERVER_EVENTS.MESSAGE, message)
	}

	static leave(data, socket, connections) {
		const {roomId} = data
		socket.to(roomId).emit(SERVER_EVENTS.LEFT, {username: socket.request.user.username})
		socket.leave({roomId})
	}

	static create(data, socket, connections) {
		console.log('Create Event')
		const {invitedUsersIndexes} = data
		const roomId = uuidv4()
		console.log('Create Event:', invitedUsersIndexes, roomId)
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