const responseManager = require('./utilities/responseManager')
const Utilities = require('../../utilities')
const logger = require('../../logger')
const emailer = require('./email')
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

		const serverURL = req.protocol + '://' + req.get('host') + req.originalUrl
		const hashToken = emailer.createToken()
		prepareVerification({
			username: userData.username,
			email: userData.email
		}, serverURL, hashToken)

		const userInstance = new UserModel(userData)
		userInstance.save()
			.then(() => responseManager.sendResponse(res, responseManager.MESSAGES.SUCCESSES.OK))
			.catch(err => {
				logger.info(`Register contoller error: ${err}`)
				responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)
			})
	}
}

function prepareVerification(userData, host, token){ //FIXME: NAME BETTER
	const VerifyModel = require('../../models/verification')

	const {username, email} = userData
	const link =`${host}/verification?key=${token}`
    const subject = 'Verification Email'
	const body = `You can activate your account at ${link}. It will expire after 30  days.` //TODO: Make it expire after 30 days

	const verifyData = {username, token}
	const verifyInstance = new VerifyModel(verifyData)
	
	verifyInstance.save()
		.then(() => emailer.sendMail(email, subject, body))
		.catch(err => {
			logger.info(`Register contoller error: ${err}`)
			responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)
		})
}

module.exports = {
	post: createPostRegisterController
}