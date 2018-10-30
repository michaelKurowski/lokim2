const logger = require('./logger')
const express = require('express')
const app = express()
const httpServer = require('http').Server(app)
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)

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

	const connectToDb = require('./connectToDb')
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

	const connectToSMTP = require('./connectToSMTP')
	
	const transporter = connectToSMTP()
	transporter.verify((err) => {
		if(err) throw Error(`Transporter Verification Error: ${err}`)
		logger.info('Email server is ready to take our messages')
	})

	return {
		httpServerListening,
		dbConnection
	}
}

module.exports = init
