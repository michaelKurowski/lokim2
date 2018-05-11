const responseManager = require('../routes/controllers/utilities/responseManager')
const Utilities = require('../utilities')

const STRATEGY_NAME = 'LOGIN_STRATEGY'
const FIELDS_NAMES = {
	USERNAME_FIELD: 'username',
	PASSWORD_FIELD: 'password'
}

function strategyHandlers(req, res, next) {
	const serializeHandler = (err) => {
		if (err) return responseManager.sendResponse(res, err)
		
		next()
	}

	const loginStrategyHandler = (err, user) => {
		if (err)
			return responseManager.sendResponse(res, err)

		if (user)	
			req.logIn(user, serializeHandler)
		else
			return responseManager.sendResponse(res, responseManager.MESSAGES.errors.BAD_REQUEST)
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
		done(error, user)
		return
	}

	const userToSerialize = null
	done(responseManager.MESSAGES.errors.UNAUTHORIZED, userToSerialize)
	return
}

module.exports = {
	FIELDS_NAMES,
	STRATEGY_NAME,
	strategyHandlers,
	validateUserPassword
}