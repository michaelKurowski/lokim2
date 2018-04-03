const responseManager = require('../routes/controllers/utilities/responseManager')
const Utilities = require('../utilities')

const STRATEGY_NAME = 'LOGIN_STRATEGY'
const FIELDS_NAMES = {
	username_field: 'username',
	password_field: 'password'
}

function strategyHandlers(req, res, next) {
	const serializeHandler = (err) => {
		if (err)
			return responseManager.createResponse(res, err)
		
		next()
	}

	const loginStrategyHandler = (err, user, info) => {
		if (err)
			return responseManager.createResponse(res, err)

		if (user)	
			req.logIn(user, serializeHandler)
		else
			return responseManager.createResponse(res, responseManager.CODES.errors.UNAUTHORIZED)
	}

	return {
		serializeHandler,
		loginStrategyHandler
	}
		
}

function findUserHandler(username, password, done) {
	const foundUser = user => {
		const hash = Utilities.createSaltedHash(user.salt, password)
		if (hash == user.password)
			return done(null, user)

		return done(responseManager.CODES.errors.UNAUTHORIZED, null)
	}

	const userNotFound = () => done(responseManager.CODES.errors.UNAUTHORIZED, null)
	
	return {
		foundUser,
		userNotFound
	}
}

module.exports = {
	FIELDS_NAMES,
	STRATEGY_NAME,
	strategyHandlers,
	findUserHandler
}