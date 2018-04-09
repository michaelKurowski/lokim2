const ConnectionsRepository = require('./ConnectionsRepository')
const Utilities = require('../utilities')

const RoomController = require('./controllers/Room')


function initializeWebSocketRouting(io, protocol = require('../protocol/protocol.json')) {
	Utilities.createWebsocketRoute(io, protocol.room, RoomController, new ConnectionsRepository())
}

module.exports = initializeWebSocketRouting