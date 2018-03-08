const express = require('express')
const router = express.Router()
const logger = require('../logger')
const UserModel = require('../models/user')
const Utilities = require('../utilities')
const statusCodes = require('./utilities/statusCodes')
const errorMsg = require('./utilities/errorMessages')

router.post('/', (req, res) => {
	const index = {
		username: req.body.username
	}
	
	const password = req.body.password

	UserModel.findOne(index).exec()
		.then( (doc) => {
			const hash = Utilities.createSaltedHash(doc.salt, password)

			if (hash == doc.password)
				return res.status(statusCodes.OK).send('OK')
			
			return res.status(statusCodes.UNAUTHORIZED)
				.json(Utilities.createError(errorMsg.UNAUTHORIZED_ACCESS))
		})
		.catch(err => {
			logger.error(err)
			return res.status(statusCodes.BAD_REQUEST)
				.json(Utilities.createError(errorMsg.BAD_REQUST))
		})
	
})

module.exports = router