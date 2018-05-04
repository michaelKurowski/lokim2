const io = require('socket.io-client')
const IO_CONNECTION_URL = 'localhost:5000/room' /* Take this from config file in the future */
const socket = io(IO_CONNECTION_URL, {
    path: '/connection',
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: Infinity
})

module.exports = socket


