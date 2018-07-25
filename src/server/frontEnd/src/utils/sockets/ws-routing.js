const io = require('socket.io-client')
const ROOM = `room`
const USERS = `users`
const HOST = `${document.location.host}/`


let socket
module.exports = {
	create,
	get
}
function create() {
	socket = {
		room: io(`${HOST}${ROOM}`, {path: '/connection'}),
		users: io(`${HOST}${USERS}`, {path: '/connection'})
	}
	return socket
}

function get() {
	return socket
}


