const express = require('express')
const router = express.Router()
const registerController = require('./controllers/register')
const logInUser = require('./controllers/Middlewares/logInUser')
const responseManager = require('./controllers/utilities/responseManager')

router.post('/register', registerController.post())
router.post('/login', logInUser, 
	(req, res) => responseManager.createResponse(res, responseManager.MESSAGES.successes.OK))

module.exports = router