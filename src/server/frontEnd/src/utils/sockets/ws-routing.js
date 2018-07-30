const io = require('socket.io-client')
const _ = require('lodash')

const ROOM = `room`
const USERS = `users`
const HOST = `${document.location.host}/`
const WEBSOCKET_ENDPOINT = '/connection'
let socket

module.exports = {
	create,
	inject,
	get
}

function create() {
	socket = {
		room: io(`${HOST}${ROOM}`, {path: WEBSOCKET_ENDPOINT}),
		users: io(`${HOST}${USERS}`, {path: WEBSOCKET_ENDPOINT})
	}
	return socket
}

function get() {
	return socket
}