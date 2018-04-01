const UserModel = require('../../models/user')
const uuidv4 = require('uuid/v4')
const namespaces = require('../../protocol/webSocketNamespaces')
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
		console.log('#join', data, roomId, typeof data)
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
		//console.log(socket)

		socket.join(roomId)
		socket.emit('joined', {userId: socket.client.conn.id})
		socket.emit('debug', `Joined room: ${roomId}`)
		
		_.forEach(invitedUsers, userId => {
			//TODO get users from connections
			const invitedUserSocket = socket.server.sockets.sockets[userId]
			invitedUserSocket.join(roomId)
			invitedUserSocket.to(roomId).emit('joined', {userId: userId})
			invitedUserSocket.to(roomId).emit('debug', `Joined room: ${roomId}`)
		})
		

	}

	static list(data, socket, connections) {
		console.log(Object.keys(socket.server.sockets.sockets))
		const namespace = socket.nsp
		namespace.clients((error, clients) => {
			socket.emit('listClients', clients)
			console.log('ROOMS', clients)
		})
	}
}

module.exports = Room