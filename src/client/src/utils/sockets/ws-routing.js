const io = require('socket.io-client')
const IO_CONNECTION_URL = 'localhost:5000/room' /* Take this from config file in the future */
const socket = io(IO_CONNECTION_URL, {path: '/connection'})


// socket.on('connect', _ => {
//     socket.on('join', data => {
//         console.log('Joined', data)
        
//         socket.on('message', msgData => {
//             console.log('Message', msgData)
//             this.setState(updateState('messages', this.state.messages, msgData))
//         })
//         socket.emit('message', {roomId, message: 'Hello World!: ' + Math.round(Math.random() * 10)})
//     })
// })

module.exports = socket


