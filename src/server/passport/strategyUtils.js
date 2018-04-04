const responseManager = require('../routes/controllers/utilities/responseManager')
const Utilities = require('../utilities')

const STRATEGY_NAME = 'LOGIN_STRATEGY'
const FIELDS_NAMES = {
	USERNAME_FIELD: 'username',
	PASSWORD_FIELD: 'password'
}

function strategyHandlers(req, res, next) {
	const serializeHandler = (err) => {
		if (err) return responseManager.createResponse(res, err)
		
		next()
	}

	const loginStrategyHandler = (err, user, info) => {
		if (err)
			return responseManager.createResponse(res, err)

		if (user)	
			req.logIn(user, serializeHandler)
		else
			return responseManager.createResponse(res, responseManager.MESSAGES.errors.UNAUTHORIZED)
	}

	return {
		serializeHandler,
		loginStrategyHandler
	}		
}

function validateUserPassword(user, password, done) {
	const hash = Utilities.createSaltedHash(user.salt, password)
	if (hash === user.password) {
		const error = null
		return done(error, user)
	}

	const userToSerialize = null
	return done(responseManager.MESSAGES.errors.UNAUTHORIZED, userToSerialize)
}

module.exports = {
	FIELDS_NAMES,
	STRATEGY_NAME,
	strategyHandlers,
	validateUserPassword
}