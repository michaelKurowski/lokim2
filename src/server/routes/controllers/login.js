const logger = require('../../logger')
const Utilities = require('../../utilities')
const statusCodes = require('./utilities/statusCodes')
const msg = require('./utilities/responseMessages')
const passportStatics = require('../../passport/passportStatics')
const passport = require('passport')

function createPostLoginController() {
	return (req, res, next) => {
	
		if(req.isAuthenticated()) {
			return res.status(statusCodes.OK).send(msg.successes.LOGGED_USER)
		}
	

		passport.authenticate(passportStatics.LOGIN_STRATEGY, passportAuthCallback(req, res))(req, res, next)
	
	}
}

const passportAuthCallback = function(req, res) {
	return (err, user, info) => {
		if (!user) { 
			res.status(statusCodes.UNAUTHORIZED)
			return res.send(Utilities.createMessage(msg.errors.UNAUTHORIZED)) }
		
		req.logIn(user, function(err) {
			if (err) { 
				logger.error(err) 
				res.status(statusCodes.INTERNAL_SERVER)
				return res.send(Utilities.createMessage(msg.errors.INTERNAL_SERVER))
			}
			return res.status(statusCodes.OK).send(msg.successes.LOGGED_USER)
		})
	}
}


module.exports = {
	post: createPostLoginController
}