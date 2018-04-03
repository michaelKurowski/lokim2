const express = require('express')
const router = express.Router()
const registerController = require('./controllers/register')
const checkSessionMiddleware = require('./controllers/Middlewares/checkSession')
const responseManager = require('./controllers/utilities/responseManager')

router.post('/register', registerController.post())
router.post('/login', checkSessionMiddleware, 
	(req, res) => responseManager.createResponse(res, responseManager.MESSAGES.successes.OK))

module.exports = router