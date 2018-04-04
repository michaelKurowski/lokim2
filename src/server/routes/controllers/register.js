const responseMessages = require('./utilities/responseMessages')
const statusCodes = require('./utilities/statusCodes')
const Utilities = require('../../utilities')
const logger = require('../../logger')
const SALT_SIZE = 70

function createPostRegisterController(UserModel = require('../../models/user')) {
	return (req, res) => {
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
			.then(() => {
				res.status(statusCodes.OK)
				const responseMessage = Utilities.createMessage(responseMessages.successes.USER_HAS_BEEN_CREATED)
				res.json(responseMessage)
			})
			.catch(err => {
				logger.info(`Register contoller error: ${err}`)
				const responseMessage = Utilities.createMessage(responseMessages.errors.FAILED_TO_CREATE_USER)
				res.status(statusCodes.BAD_REQUEST)
				res.json(responseMessage)
				return 
			})
	}
}

module.exports = {
	post: createPostRegisterController
}