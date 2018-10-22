const responseManager = require('./utilities/responseManager')
const Utilities = require('../../utilities')
const logger = require('../../logger')
const serverURL = require('../../config').host
const emailController = require('./email')
const SALT_SIZE = 70

function createPostRegisterController(
	UserModel = require('../../models/user'), 
	VerifyModel = require('../../models/verification'),
	Transporter = emailController.prepareTransporter()) {
	return (req, res) => {
		const salt = Utilities.generateSalt(SALT_SIZE)
		const password = Utilities.createSaltedHash(salt, req.body.password)

		const userData = {
			username: req.body.username,
			email: req.body.email,
			password,
			salt
		}


		const hashToken = emailController.createToken()
		const saveVerificationDetails = emailController.saveRecordToDB(VerifyModel)
		const sendVerificationMail = emailController.sendVerificationMail(Transporter)

		const userInstance = new UserModel(userData)
		userInstance.save()
			.then(() => saveVerificationDetails(userData.username, hashToken))
			.then(() => sendVerificationMail(userData.email, serverURL, hashToken))
			.then(() => responseManager.sendResponse(res, responseManager.MESSAGES.SUCCESSES.OK))
			.catch(err => {
				logger.info(`Register contoller error: ${err}`)
				responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)
			})
	}
}

module.exports = {
	post: createPostRegisterController
}