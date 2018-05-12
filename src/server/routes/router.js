const express = require('express')
const router = express.Router()
const registerController = require('./controllers/register')
const logInUser = require('./controllers/Middlewares/logInUser')
const responseManager = require('./controllers/utilities/responseManager')
const config = require('../config.json')
const path = require('path')

router.post('/register', registerController.post())
router.post('/login', logInUser(), 
	(req, res) => responseManager.sendResponse(res, responseManager.MESSAGES.successes.OK))

router.use('/protocol', express.static(path.join(process.cwd(), '/protocol')))
if (config.devPropeties.devMode) 
	router.use('/test', express.static(path.join(process.cwd(), '/.tests/tools')))

module.exports = router