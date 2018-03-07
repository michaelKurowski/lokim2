const express = require('express')
const router = express.Router()
const UserModel = require('../models/user')
const logger = require('../logger.js')
const Utilities = require('../utilities')

const saltSize = 70

router.post('/', (req, res) => {

	UserModel.on('index', err => logger.error(`Not created indexes: ${err}`))
	
	const userInstance = new UserModel(req.body)

	userInstance.salt = Utilities.generateSalt(saltSize)
	userInstance.password = Utilities.hashPassword(userInstance.salt, userInstance.password)
	userInstance.save()
		.then( () => {return res.status(200).send('Created new user')})
		.catch( (err) => {
			logger.error(err)
			return res.status(500).send(err.message)
		})

})

module.exports = router
