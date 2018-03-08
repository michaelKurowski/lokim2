const express = require('express')
const router = express.Router()
const UserModel = require('../models/user')
const logger = require('../logger.js')
const Utilities = require('../utilities')

const SALT_SIZE = 70

router.post('/', (req, res) => {
	
	const userData = {
		username: req.body.username,
		email: req.body.email,
		password: req.body.password,
		salt: ''
	}

	const userInstance = new UserModel(userData)
	
	userInstance.validate(err => {
		if(err) {
			logger.error(err)
			return res.status(500).send(err.message)
		}

		userInstance.salt = Utilities.generateSalt(SALT_SIZE)
		userInstance.password = Utilities.createSaltedHash(userInstance.salt, userInstance.password)
		
		userInstance.save()
			.then( () => res.status(200).send('Created new user'))
			.catch( (err) => {
				logger.error(err)
				return res.status(500).send(err.message)
			})
	})
	

})

module.exports = router
