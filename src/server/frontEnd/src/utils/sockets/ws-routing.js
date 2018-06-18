const io = require('socket.io-client')
const IO_CONNECTION_URL = `${document.location.host}/room` /* Take this from config file in the future */
const socket = io(IO_CONNECTION_URL, {path: '/connection'})

module.exports = socket


