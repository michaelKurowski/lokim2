const express = require('express')
const router = require('./routes/router')
const bodyParser = require('body-parser')
const config = require('./config.json')
const app = express()
const logger = require('./logger.js')

app.use(bodyParser.json())

app.use(router)

app.listen(config.httpServer.port, (err) => {
	if (err) {
		logger.error(`Error during attempting to listen for port ${config.httpServer.port}`)
		return
	}
	logger.info(`HTTP server is listening on port ${config.httpServer.port}`)
})
