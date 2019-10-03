const crypto = require('crypto')
const _ = require('lodash')
const WEBSOCKET_COOKIE_NAME = 'io'
const util = require('util')
class Utilities {

	static generateSalt (size) {
		if (!size) return null
		return crypto.randomBytes(size).toString('base64')
	}

	static createSaltedHash(salt = null, passpharse = null) {
		if(passpharse === null || salt === null)
			return null
		
		const hash = crypto.createHash('sha256')
		return  hash.update(passpharse + salt).digest('hex')	
	}
	
	static disconnectWebSockets(res, username, connectionRepository) {
		const userSocket = connectionRepository.usersToConnectionsMap.get(username)
		if(userSocket) {
			const DISCONNECT_FROM_ALL_NAMESPACES = true
			userSocket.disconnect(DISCONNECT_FROM_ALL_NAMESPACES)
			res.clearCookie(WEBSOCKET_COOKIE_NAME)
		}
	}

	static createWebsocketRoute(io, namespaceInfo, ControllerClass, connectionsRepository) {
		if (!namespaceInfo.name || !namespaceInfo.eventTypes)
			throw new Error(`${JSON.stringify(namespaceInfo)} is not a valid namespace protcol object`)
		io.of(namespaceInfo.name)
			.on('connection', bindEventListenersToSocket(namespaceInfo, ControllerClass, connectionsRepository))
	}

	// This is an utility for debugging websocket room members
	static getUsersInWebsocketRoom(socket, roomId) {
		const room = socket.nsp.in(roomId)
		return getRoomClients(room)
			.then(clients => {
				return _.map(clients, socketId => 
					getUsername(room.connected[socketId]))
			})
	}
}

function bindEventListenersToSocket(namespaceInfo, ControllerClass, connectionsRepository) {
	return socket => {
		const eventTypes = _.values(namespaceInfo.eventTypes)
		const serverEventTypes = _.values(namespaceInfo.serverEventTypes)
		const doesClientEventListContainDuplicates = 
			_.uniq(eventTypes).length !== eventTypes.length
		const doesServerEventListContainDuplicates = 
			_.uniq(serverEventTypes).length !== serverEventTypes.length
		if (doesClientEventListContainDuplicates
			|| doesServerEventListContainDuplicates)
			throw new Error(`Event types of "${namespaceInfo.name}" contain duplicates.`)

		const controller = new ControllerClass()
		_.forEach(eventTypes, setEventListener(socket, controller, connectionsRepository, namespaceInfo))
	}
}

async function getRoomClients(room) {
	const getClients = room.clients.bind(room)
	return await util.promisify(getClients)()
}

function runConnectionEventHandler(socketToPass, controller, connectionsRepository) {
	controller.connection(socketToPass, connectionsRepository)
}

function setEventListener(socket, controller, connectionsRepository, namespaceInfo) {
	return eventType => {
		if (!controller[eventType]) throw new Error(`Can't find event "${eventType}" in controller of namespace "${namespaceInfo.name}"`)
		if (eventType === 'connection')
			return runConnectionEventHandler(socket, controller, connectionsRepository)
		if (eventType === 'disconnect')
			return socket.on(eventType, () => controller[eventType](socket, connectionsRepository))
			
		socket.on(eventType, data => controller[eventType](data, socket, connectionsRepository))
	}
}

module.exports = Utilities

