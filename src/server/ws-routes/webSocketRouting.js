const connectionsRepository = require('./ConnectionsRepositoryProvider')
const Utilities = require('../utilities')
const logger = require('../logger')
const RoomController = require('./controllers/Room')
const UsersController = require('./controllers/Users')

function initializeWebSocketRouting(io, protocol = require('../protocol/protocol.json')) {
	Utilities.createWebsocketRoute(io, protocol.room, RoomController, connectionsRepository)
	Utilities.createWebsocketRoute(io, protocol.users, UsersController, connectionsRepository)

	logger.info(`Websocket routing initialized`)
}

function getConnectionRepository() {
	return connectionsRepository
}

module.exports = {
	initializeWebSocketRouting,
	getConnectionRepository 
}

