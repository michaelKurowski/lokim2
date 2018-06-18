const io = require('socket.io-client')
const IO_CONNECTION_URL = `${document.location.host}/room`
const socket = io(IO_CONNECTION_URL, {path: '/connection'})

module.exports = socket


