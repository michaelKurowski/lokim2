const UserModel = require('../../models/user')
const uuidv4 = require('uuid/v4')
const namespaces = require('../../protocol/webSocketNamespaces')
const _ = require('lodash')

class Room {
	static connection(socket) {
		const userId = 'AAAA'
		console.log('connection')
		socket.join(userId)
		socket.emit('debug', `Joined to room ${userId}`)
	}

	static join(data, socket) {
		const roomId = data.roomId
		console.log('#join', data, roomId, typeof data)
		socket.emit('joined', {userId: socket.client.conn.id})
		socket.join(roomId)
		socket.emit('debug', `Joined to room ${roomId}`)
	}

	static message(data, socket) {
		const roomId = data.roomId
		const message = data.message
		
		
		socket.to(roomId).emit('message', message)
		socket.to(roomId).emit('debug', `Sent message to room ${roomId}`)
	}

	static leave(data, socket) {
		socket.emit('left', {userId: socket.client.conn.id})
	}

	static create(data, socket) {
		const roomId = uuidv4()
		//console.log(socket)
		socket.join(roomId)
		socket.emit('joined', {userId: socket.client.conn.id})
		socket.emit('debug', `Joined room: ${roomId}`)
	}

	static list(data, socket) {
		const namespace = socket.nsp
		namespace.clients((error, clients) => {
			socket.emit('listClients', clients)
			console.log('CLIENTS', clients)
		})
	}
}

module.exports = Room