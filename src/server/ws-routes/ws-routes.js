const webSocketNameSpaces = require('../protocol/webSocketNamespaces')
const _ = require('lodash')

const Utilities = require('../utilities')




module.exports = function (io) {
	_.forEach(webSocketNameSpaces, namespaceInfo => {
		Utilities.createWebsocketRoute(io, namespaceInfo, require('./controllers/room'))
	})
}