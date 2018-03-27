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

	static createWebsocketRoute(io, namespaceInfo, controllersBundle) {
		io.of(namespaceInfo.name)
			.on('connection', bindEventListenersToSocket(namespaceInfo, controllersBundle))
	}
}

function bindEventListenersToSocket(namespaceInfo, controllersBundle) {
	return socket => {
		const eventTypesSet = namespaceInfo.eventTypes
		const areEventTypesNotSet = !(eventTypesSet instanceof Set)
		if (areEventTypesNotSet) throw `Event types of "${namespaceInfo.name}" should be instance of Set, but are "${eventTypesSet.constructor.name}"`
		const eventTypesList = [...namespaceInfo.eventTypes]
		_.forEach(eventTypesList, setEventListener(socket, controllersBundle))
	}
}

function runConnectionEventHandler(socketToPass, controllersBundle) {
	controllersBundle['connection'](socketToPass)
}

function setEventListener(socket, controllersBundle) {
	return eventType => {
		if (!controllersBundle[eventType]) throw `Can't find event "${eventType}" in controller of namespace "${namespaceInfo.name}"`
		if (eventType === 'connection')
			return runConnectionEventHandler(socket, controllersBundle)
		socket.on(eventType, data => controllersBundle[eventType](data, socket))
	}
}

module.exports = Utilities

