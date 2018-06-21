const io = require('socket.io-client')
const ROOM = `room`
const USERS = `users`
const HOST = `${document.location.host}/`

module.exports = {
	room: io(`${HOST}${ROOM}`, {path: '/connection'}),
	users: io(`${HOST}${USERS}`, {path: '/connection'})
}


