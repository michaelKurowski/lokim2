const express = require('express')
const router = express.Router()
const registerController = require('./controllers/register')
const loginController = require('./controllers/login')

router.post('/register', registerController.post())
router.post('/login', loginController.post())

module.exports = router