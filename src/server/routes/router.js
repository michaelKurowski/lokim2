const express = require('express')
const router = express.Router()
const registerController = require('./controllers/register')
const logInUser = require('./controllers/logInUser')
const logOutUser = require('./controllers/logOutUser')
const emailController = require('./controllers/email')
const isUserAuthenticated = require('./controllers/Middleware/isUserAuthenticated')
const config = require('../config.json')
const path = require('path')

router.post('/register', registerController.post())
router.post('/login', logInUser())
router.post('/logout', isUserAuthenticated(), logOutUser())
router.get('/verify/:token', emailController.verifyUser())

router.use('/protocol', express.static(path.join(process.cwd(), '/protocol')))
router.use('/', express.static(path.join(process.cwd(), '/public')))
router.use('/email-is-invalid', express.static(path.join(process.cwd(), '/public')))
router.use('/email-is-valid', express.static(path.join(process.cwd(), '/public')))
if (config.devPropeties.devMode) 
	router.use('/test', express.static(path.join(process.cwd(), '/.tests/tools')))

module.exports = router