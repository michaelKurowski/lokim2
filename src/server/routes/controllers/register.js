const errorMessages = require('./utilities/errorMessages')
const statusCodes = require('./utilities/statusCodes')
const Utilities = require('../../utilities')
const logger = require('../../logger.js')
const SALT_SIZE = 70

function createPostRegisterController(UserModel = require('../../models/user')) {
	return (req, res) => {
		const data = req.body
		if (!data.username || !data.password || !data.email) {
			const responseMessage = Utilities.createError(errorMessages.FAILED_TO_CREATE_USER)
			res.status(statusCodes.BAD_REQUEST)
			res.send(responseMessage)
			return 
		}

		const salt = Utilities.generateSalt(SALT_SIZE)
		const password = Utilities.createSaltedHash(salt, req.body.password)

		const userData = {
			username: req.body.username,
			email: req.body.email,
			password,
			salt
		}

		const userInstance = new UserModel(userData)

		userInstance.save()
			.then(() => res.status(statusCodes.OK).send('Created new user'))
			.catch(err => {
				logger.error(`Register contoller error: ${err}`)
				const responseMessage = Utilities.createError(errorMessages.FAILED_TO_CREATE_USER)
				res.status(statusCodes.BAD_REQUEST)
				res.send(responseMessage)
				return 
			})
	}
}

module.exports = {
	post: createPostRegisterController
}