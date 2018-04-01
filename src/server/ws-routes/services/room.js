const uuidv4 = require('uuid/v4')
const _ = require('lodash')

class Room {
	static connection(socket, connections) {
		//TODO get user ID from req
		const userId = 'AAAA' + uuidv4()
		console.log(userId, 'connected')
		socket.join(userId)
		connections.usersToConnectionsMap.set(userId, socket)
		
		socket.emit('joined', {userId})
	}

	static join(data, socket, connections) {
		const roomId = data.roomId
		socket.emit('joined', {userId: socket.client.conn.id})
		socket.join(roomId)
		socket.emit('debug', `Joined to room ${roomId}`)
	}

	static message(data, socket, connections) {
		const roomId = data.roomId
		const message = data.message
		
		socket.to(roomId).emit('message', message)
		socket.to(roomId).emit('debug', `Sent message to room ${roomId}`)
	}

	static leave(data, socket, connections) {
		socket.emit('left', {userId: socket.client.conn.id})
	}

	static create(data, socket, connections) {
		const invitedUsers = data.invitedUsers
		const roomId = uuidv4()

		Room.join(roomId, socket, connections)

		_.forEach(invitedUsers, userId => {
			const invitedUserSocket = connections.usersToConnectionsMap.get(userId)
			Room.join(roomId, invitedUserSocket, connections)
		})
	}

	static list(data, socket, connections) {
		const namespace = socket.nsp
		namespace.clients((error, clients) => {
			socket.emit('listClients', clients)
			console.log('ROOMS', clients)
		})
	}
}

module.exports = Room