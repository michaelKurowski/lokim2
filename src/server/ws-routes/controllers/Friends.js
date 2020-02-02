const EVENT_TYPES = require('../../protocol/protocol.json').frineds

class Friends {
    [EVENT_TYPES.CONNECTION](socket, connections) {
        const username = socket.request.user.username
        connections.usersToConnectionsMap.set(username, socket)
    }

    [EVENT_TYPES.DISCONNECT](socket, connections) {
        const username = socket.request.user.username
        connections.usersToConnectionsMap.delete(username) 
    }
}

module.exports = Friends