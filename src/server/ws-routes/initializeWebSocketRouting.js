const ConnectionsRepository = require('./ConnectionsRepository')
const Utilities = require('../utilities')
const logger = require('../logger')

const RoomController = require('./controllers/Room')
const UsersController = require('./controllers/Users')

function initializeWebSocketRouting(io, protocol = require('../protocol/protocol.json')) {
	Utilities.createWebsocketRoute(io, protocol.room, RoomController, new ConnectionsRepository())
	Utilities.createWebsocketRoute(io, protocol.users, UsersController, new ConnectionsRepository())
	logger.info(`Websocket routing initialized`)
}

module.exports = initializeWebSocketRouting

