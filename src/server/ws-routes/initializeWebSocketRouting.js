const ConnectionsRepository = require('./ConnectionsRepository')

const Utilities = require('../utilities')


module.exports = initializeWebSocketRouting

function initializeWebSocketRouting(io, protocol = require('../protocol/protocol.json')) {

	Utilities.createWebsocketRoute(io, protocol.room, require('./controllers/Room'), new ConnectionsRepository())

}