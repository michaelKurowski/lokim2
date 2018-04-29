const ConnectionsRepository = require('./ConnectionsRepository')
const Utilities = require('../utilities')
const logger = require('../logger')

const RoomController = require('./controllers/Room')


function initializeWebSocketRouting(io, protocol = require('../protocol/protocol.json')) {
	Utilities.createWebsocketRoute(io, protocol.room, RoomController, new ConnectionsRepository())
	logger.info(`Websocket routing initialized`)
}

module.exports = initializeWebSocketRouting

/**
 * UUID v4 string value
 * @typedef {(string)} uuid
 * @see https://en.wikipedia.org/wiki/Universally_unique_identifier#Format
 * @example
 * "f64f2940-fae4-11e7-8c5f-ef356f279131"
 * "c6235813-3ba4-3801-ae84-e0a6ebb7d138"
 * "e8b5a51d-11c8-3310-a6ab-367563f20686"
 */