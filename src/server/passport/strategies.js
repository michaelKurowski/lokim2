const strategyUtils = require('./strategyUtils')
const responseManager = require('../routes/controllers/utilities/responseManager')

const loginStrategy = (UserModel = require('../models/user')) => {
	const validateUser = (username, password, done) => {
		const index = {
			username
		}
		UserModel.findOne(index).exec()
			.then(user => strategyUtils.validateUserPassword(user, password, done))
			.catch(() => {
				const userToSerialize = null
				done(responseManager.MESSAGES.errors.UNAUTHORIZED, userToSerialize)
			})
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