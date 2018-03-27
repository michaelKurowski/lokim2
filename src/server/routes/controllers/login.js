const Utilities = require('../../utilities')
const statusCodes = require('./utilities/statusCodes')
const msg = require('./utilities/responseMessages')
const passportStrategiesNames = require('../../passport/strategiesNames')


function createPostLoginController(passport = require('passport'), loginUtils = require('./utilities/loginUtils')) {
	return (req, res, next) => {
		if(req.isAuthenticated()) {
			return res.status(statusCodes.OK)
				.json(Utilities.createMessage(msg.successes.LOGGED_USER))
		}
		const authUtils = loginUtils.authenticationUtils(req, res)
		passport.authenticate(passportStrategiesNames.LOGIN_STRATEGY, authUtils.handleAuthentication)(req, res, next)
	}
}

module.exports = {
	post: createPostLoginController
}