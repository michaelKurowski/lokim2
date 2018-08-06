const responseManager = require('../routes/controllers/utilities/responseManager')
const Utilities = require('../utilities')

const STRATEGY_NAME = 'LOGIN_STRATEGY'
const FIELDS_NAMES = {
	USERNAME_FIELD: 'username',
	PASSWORD_FIELD: 'password'
}

function validateUserPassword(user, password) {
	const hash = Utilities.createSaltedHash(user.salt, password)
	const hashedPassword = user.password
	const error = (hash === hashedPassword) ? null : responseManager.MESSAGES.ERRORS.UNAUTHORIZED
	return error
}

module.exports = {
	FIELDS_NAMES,
	STRATEGY_NAME,
	validateUserPassword
}