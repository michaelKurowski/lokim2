const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const SERVER_EVENTS = namespaceInfo.serverEventTypes

class Room {
	static connection(socket, connections) {
		//TODO get user ID from req
		const userId = socket.client.conn.id
		const roomId = 'AAAA' + uuidv4()
		//console.log(userId, 'connected', Object.keys(socket.handshake), 'cookie ' + socket.handshake.headers.cookie)
		connections.usersToConnectionsMap.set(userId, socket)
		Room.join({roomId}, socket, connections)
	}

	static join(data, socket, connections) {
		const {roomId} = data
		const userId = socket.client.conn.id //TODO get user ID from deserialized req
		console.log(JSON.stringify({userId, roomId}), 'JOINED')
		socket.emit(SERVER_EVENTS.JOINED, {userId, roomId})
		socket.join(roomId)
	}

	static message(data, socket, connections) {
		const {roomId, message} = data
		console.log(JSON.stringify({roomId, message}))
		socket.to(roomId).emit(SERVER_EVENTS.MESSAGE, message)
	}

	static leave(data, socket, connections) {
		const {roomId} = data
		socket.leave(roomId)
		socket.emit(SERVER_EVENTS.LEFT, {userId: socket.client.conn.id})
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