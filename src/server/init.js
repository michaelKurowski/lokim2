const express = require('express')
const app = express()
const httpServer = require('http').Server(app)
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)
const connectToDb = require('./connectToDb')
const dbConnectionProvider = require('./dbConnectionProvider')

const initializationProcedures = require('./initializationProcedures')
async function init({
	injectedHttpPort
} = {}) {
	await initializationProcedures.initializeConfig()
	const config = require('./config.json')

	const dbUsername = process.env.DB_USERNAME || config.database.username
	const dbPassword = process.env.DB_PASSWORD || config.database.password
	const dbHostname = process.env.DB_HOSTNAME || config.database.host

	const dbConnection = connectToDb(dbUsername, dbPassword, dbHostname)
	dbConnectionProvider.setDbConnection(dbConnection)

	const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
	const cookieHttpSessionConfig = initializationProcedures.createCookiesHttpSessionConfigObject(config, sessionStore)
	const cookieWebsocketSessionConfig = initializationProcedures.createCookiesWebsocketSessionConfigObject(config, sessionStore)

	const router = require('./routes/router')

	initializationProcedures.initializeHttpRequestProcessingFlow(app, router, cookieHttpSessionConfig)
	initializationProcedures.initializeWebSocketEventProcessingFlow(httpServer, cookieWebsocketSessionConfig)
	initializationProcedures.initializePassport()

	const httpPort = process.env.PORT || injectedHttpPort || config.httpServer.port
	const httpServerListening = initializationProcedures.initializeHttpServer(httpServer, httpPort)

	return {
		httpServerListening,
		dbConnection
	}
}

module.exports = init
