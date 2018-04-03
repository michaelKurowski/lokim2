const strategyUtils = require('./strategyUtils')

const loginStrategy = (UserModel = require('../models/user')) => {
	const validateUser = (username, password, done) => {
		const index = {
			username
		}
	
		const validateUserPassword = strategyUtils.validateUserPassword(username, password, done)
		UserModel.findOne(index).exec()
			.then(validateUserPassword.foundUser)
			.catch(validateUserPassword.userNotFound)
	}

	const serialzeUser = (user, done) => {
		const error = null
		done(error, user.id)
	}

	const deserializeUser = (id, done) => UserModel.findById(id, done)

	return {
		validateUser,
		serialzeUser,
		deserializeUser
	}
}

module.exports = {
	loginStrategy
}