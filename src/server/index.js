const express = require('express')
const register = require('./routes/register')
const bodyParser = require('body-parser')
const config = require('./config.json')
const app = express()
const logger = require('./logger.js')

app.use(bodyParser.json())

app.use('/register', register)

app.listen(config.httpServer.port, (err)=> {
	if (err){
		logger.error(`Error during attempting to listen for port ${config.httpServer.port}`)
		return
	}
	logger.info(`HTTP server is listening on port ${config.httpServer.port}`)
})
