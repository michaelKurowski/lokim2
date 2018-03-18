
const express = require('express')
const router = express.Router()
const UserModel = require('../models/user')
const logger = require('../logger.js')
const Utilities = require('../utilities')
const msg = require('./utilities/messages')
const statusCodes = require('./utilities/statusCodes')
const SALT_SIZE = 70

router.post('/', (req, res) => {
	
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
		.then( () => res.status(statusCodes.OK).send('Created new user'))
		.catch( err => {
			logger.error(err)
			return res.status(statusCodes.BAD_REQUEST)
				.send(Utilities.createError(msg.Errors.BAD_REQUST))
		})
})

module.exports = router
