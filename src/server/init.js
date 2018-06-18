const express = require('express')
const app = express()
const httpServer = require('http').Server(app)
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)
const connectToDb = require('./connectToDb')
const dbConnectionProvider = require('./dbConnectionProvider')

const initializationUtils = require('./initializationUtils')
async function init({
	injectedHttpPort
} = {}) {
	await initializationUtils.initializeConfig()
	const config = require('./config.json')

	const dbUsername = process.env.DB_USERNAME || config.database.username
	const dbPassword = process.env.DB_PASSWORD || config.database.password
	const dbHostname = process.env.DB_HOSTNAME || config.database.host

	const dbConnection = connectToDb(dbUsername, dbPassword, dbHostname)
	dbConnectionProvider.setDbConnection(dbConnection)

	const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
	const cookieHttpSessionConfig = initializationUtils.createCookiesHttpSessionConfigObject(config, sessionStore)
	const cookieWebsocketSessionConfig = initializationUtils.createCookiesWebsocketSessionConfigObject(config, sessionStore)

	const router = require('./routes/router')

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
