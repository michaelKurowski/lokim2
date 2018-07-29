const io = require('socket.io-client')
const _ = require('lodash')
const serverProvidedProtocols = require('../../../../protocol/protocol.json')
const actions = require('../../services/webSocket/webSocket.actions').actions

const ROOM = `room`
const USERS = `users`
const HOST = `${document.location.host}/`
const protocols = require('../io-protocol.json')

let socket
let dispatch

module.exports = {
	create,
	inject,
	get
}

function inject(injectedDispatch) {
	dispatch = injectedDispatch
}

function create() {
	socket = {
		room: io(`${HOST}${ROOM}`, {path: '/connection'}),
		users: io(`${HOST}${USERS}`, {path: '/connection'})
	}
	//setupListeners()
	return socket
}

function get() {
	return socket
}

function setupListeners() {
	_.forEach(serverProvidedProtocols, namespace => 
		_.forEach(namespace.eventTypes, eventType => 
			socket[namespace.name].on(eventType, event => 
				dispatch(actions.webSocketEvent({event, type: eventType}))
			)
		)
	)
	
	socket.room.on(protocols.CONNECTION, event => dispatch(actions.room.connected(event)))
	socket.room.on(protocols.MESSAGE, event => dispatch(actions.room.messageReceived(event)))
	socket.room.on(protocols.JOIN, event => dispatch(actions.room.userJoined(event)))
	socket.room.on(protocols.LIST_MEMBERS, event => dispatch(actions.room.membersListed(event)))

	socket.users.on(protocols.CONNECTION, event => dispatch(actions.users.connected(event)))
	socket.users.on(protocols.FIND, event => dispatch(actions.users.usersFound(event)))
}


