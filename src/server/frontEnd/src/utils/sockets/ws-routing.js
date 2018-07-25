const io = require('socket.io-client')

const actions = require('../../services/webSocketsListeners/webSocketListener.actions').actions

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
	setupListeners()
	return socket
}

function get() {
	return socket
}

function setupListeners() {
	socket.room.on(protocols.CONNECTION, () => dispatch(actions.room.connected()))
	socket.room.on(protocols.MESSAGE, () => dispatch(actions.room.messageReceived()))
	socket.room.on(protocols.JOIN, () => dispatch(actions.room.userJoined()))
	socket.room.on(protocols.LIST_MEMBERS, () => dispatch(actions.room.membersListed()))

	socket.users.on(protocols.CONNECTION, () => dispatch(actions.users.connected()))
	socket.users.on(protocols.FIND, () => dispatch(actions.users.usersFound()))
}


