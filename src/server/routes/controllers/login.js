const Utilities = require('../../utilities')
const statusCodes = require('./utilities/statusCodes')
const msg = require('./utilities/responseMessages')
const passportStrategiesNames = require('../../passport/strategiesNames')


function createPostLoginController(passport = require('passport'), passportCallback = require('./utilities/passportLoginCallbacks')) {
	return (req, res, next) => {
		if(req.isAuthenticated()) {
			return res.status(statusCodes.OK)
				.json(Utilities.createMessage(msg.successes.LOGGED_USER))
		}

		passport.authenticate(passportStrategiesNames.LOGIN_STRATEGY, passportCallback.authenticateCallback(req, res))(req, res, next)
	}
}

module.exports = {
	post: createPostLoginController
}