const express = require('express')
const app = express()
const httpServer = require('http').Server(app)
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)

const initializationUtils = require('./initializationUtils')
async function init({
	injectedHttpPort
} = {}) {
	await initializationUtils.initializeConfig()
	const config = require('./config.json')

	//Imports that need config file to initialize
	const router = require('./routes/router')
	const dbConnection = require('./dbConnection')

	const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
	const cookieHttpSessionConfig = initializationUtils.createCookiesHttpSessionConfigObject(config, sessionStore)
	const cookieWebsocketSessionConfig = initializationUtils.createCookiesWebsocketSessionConfigObject(config, sessionStore)

	initializationUtils.initializeHttpRequestProcessingFlow(app, router, cookieHttpSessionConfig)
	initializationUtils.initializeWebSocketEventProcessingFlow(httpServer, cookieWebsocketSessionConfig)
	initializationUtils.initializePassport()

	const httpPort = process.env.PORT || injectedHttpPort || config.httpServer.port
	const httpServerListening = initializationUtils.initializeHttpServer(httpServer, httpPort)

	return {
		httpServerListening,
		dbConnection
	}
}

module.exports = init
