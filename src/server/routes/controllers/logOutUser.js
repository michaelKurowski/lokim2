const responseManager = require('./utilities/responseManager')
const webSocketRouting = require('../../ws-routes/webSocketRouting')
const config = require('../../config.json')

function logOut(utilities = require('../../utilities')) {
	return (req, res) => {
		if (!req.session)
			return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.UNAUTHORIZED)

		const username = req.user.username
		const connectionRepository = webSocketRouting.getConnectionRepository()
		req.session.destroy(err => {
			if(err)
				return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)

			utilities.disconnectWebSockets(res, username, connectionRepository)
			res.clearCookie(config.session.cookieName)
			return responseManager.sendResponse(res, responseManager.MESSAGES.SUCCESSES.OK)
		})
	}


}

module.exports = logOut