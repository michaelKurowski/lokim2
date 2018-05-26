const crypto = require('crypto')
const _ = require('lodash')
const WEBSOCKET_COOKIE_NAME = 'io'
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

	static createMessage(textMessage) {
		return {
			description: textMessage
		}
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

function runConnectionEventHandler(socketToPass, controller, connectionsRepository) {
	controller.connection(socketToPass, connectionsRepository)
}

function setEventListener(socket, controller, connectionsRepository, namespaceInfo) {
	return eventType => {
		if (!controller[eventType]) throw new Error(`Can't find event "${eventType}" in controller of namespace "${namespaceInfo.name}"`)
		if (eventType === 'connection')
			return runConnectionEventHandler(socket, controller, connectionsRepository)
		socket.on(eventType, data => controller[eventType](data, socket, connectionsRepository))
	}
}

module.exports = Utilities

