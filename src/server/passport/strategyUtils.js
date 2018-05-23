const responseManager = require('../routes/controllers/utilities/responseManager')
const Utilities = require('../utilities')

const STRATEGY_NAME = 'LOGIN_STRATEGY'
const FIELDS_NAMES = {
	USERNAME_FIELD: 'username',
	PASSWORD_FIELD: 'password'
}

function strategyHandlers(req, res) {
	const serializeHandler = (err) => {
		if (err) return responseManager.sendResponse(res, err)
		
		return responseManager.sendResponse(res, responseManager.MESSAGES.successes.OK)
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

function validateUserPassword(user, password) {
	const hash = Utilities.createSaltedHash(user.salt, password)
	const hashedPassword = user.password
	const error = (hash === hashedPassword) ? null : responseManager.MESSAGES.errors.UNAUTHORIZED
	return error
}

module.exports = {
	FIELDS_NAMES,
	STRATEGY_NAME,
	strategyHandlers,
	validateUserPassword
}