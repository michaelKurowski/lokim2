const crypto = require('crypto')
const _ = require('lodash')
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

	static createWebsocketRoute(io, namespaceInfo, controllersBundle, connectionsRepository) {
		io.of(namespaceInfo.name)
			.on('connection', bindEventListenersToSocket(namespaceInfo, controllersBundle, connectionsRepository))
	}
}

function bindEventListenersToSocket(namespaceInfo, controllersBundle, connectionsRepository) {
	return socket => {
		const eventTypesSet = namespaceInfo.eventTypes
		const areEventTypesNotSet = !(eventTypesSet instanceof Set)
		if (areEventTypesNotSet) throw `Event types of "${namespaceInfo.name}" should be instance of Set, but are "${eventTypesSet.constructor.name}"`
		const eventTypesList = [...namespaceInfo.eventTypes]
		_.forEach(eventTypesList, setEventListener(socket, controllersBundle, connectionsRepository))
	}
}

function runConnectionEventHandler(socketToPass, controllersBundle, connectionsRepository) {
	controllersBundle['connection'](socketToPass, connectionsRepository)
}

function setEventListener(socket, controllersBundle, connectionsRepository) {
	return eventType => {
		if (!controllersBundle[eventType]) throw `Can't find event "${eventType}" in controller of namespace "${namespaceInfo.name}"`
		if (eventType === 'connection')
			return runConnectionEventHandler(socket, controllersBundle, connectionsRepository)
		socket.on(eventType, data => controllersBundle[eventType](data, socket, connectionsRepository))
	}
}

module.exports = Utilities

