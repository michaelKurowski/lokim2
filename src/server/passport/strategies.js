const responseManager = require('../routes/controllers/utilities/responseManager')
const USER_NOT_VERIFIED = 'User is not verified.'

const loginStrategy = (UserModel = require('../models/user'), strategyUtils = require('./strategyUtils')) => {
	const validateUser = (username, password, done) => {
		const validation = {user: null, query: {username}, password, validationResult: null}
		
		return Promise.resolve(validation)
			.then(assignFoundUser)
			.then(assignPasswordValidationResult)
			.then(isUserVerified)
			.then(finish)
			.catch(() => {
				const userToSerialize = null
				done(responseManager.MESSAGES.ERRORS.UNAUTHORIZED, userToSerialize)
			})

		function finish(validation) {
			done(validation.validationResult, validation.user)
		}

		function assignPasswordValidationResult(validation) {
			validation.validationResult = 
				strategyUtils.validateUserPassword(validation.user, validation.password)
			return validation
		}
	
		function assignFoundUser(validation) {
			return UserModel.findOne(validation.query).exec()
				.then(user => {
					validation.user = user
					return validation
				})
		}

		function isUserVerified(validation){
			if(!validation.user.hasOwnProperty('active') && !validation.user.active)
				throw new Error(USER_NOT_VERIFIED)
	
			return validation
		}
	}

	const serializeUser = (user, done) => {
		const error = null
		done(error, user.id)
	}

	const deserializeUser = (id, done) => UserModel.findById(id, done)

	return {
		validateUser,
		serializeUser,
		deserializeUser
	}
}

module.exports = {
	loginStrategy
}