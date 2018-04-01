const webSocketNameSpaces = require('../protocol/webSocketNamespaces')
const _ = require('lodash')
const ConnectionsRepository = require('./ConnectionsRepository')

const Utilities = require('../utilities')


module.exports = function (io) {
	_.forEach(webSocketNameSpaces, namespaceInfo => {
		Utilities.createWebsocketRoute(io, namespaceInfo, require('./services/room'), new ConnectionsRepository())
	})
}