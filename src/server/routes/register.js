const express = require('express')
const router = express.Router()
const UserModel = require('../models/user')
const logger = require('./logger.js')

router.get('/', (req, res) => {
	res.send('This will be regi page')
})

router.post('/', (req, res) => {
	logger.log(req.body)
	UserModel(req.body)
		.then(() => res.send('User has been created'))
		.catch(err => {
			logger.error(err)
			res.send(err)
		})
})


module.exports = router
