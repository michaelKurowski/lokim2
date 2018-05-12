const express = require('express')
const router = require('./routes/router')
const bodyParser = require('body-parser')
const config = require('./config.json')
const app = express()
const httpServer = require('http').Server(app)
const logger = require('./logger')
const initializeWebSocketRouting = require('./ws-routes/initializeWebSocketRouting')
const io = require('socket.io')(httpServer, {path: '/connection'})
const passport = require('passport')
const passportSocketIo = require('passport.socketio')
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)
const mongoSanitize = require('express-mongo-sanitize')
const util = require('util')

const dbConnection = require('./dbConnection')
const passportStrategies = require('./passport/strategies')
const passportStrategyUtils = require('./passport/strategyUtils')

const LocalStrategy = require('passport-local').Strategy
const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
const COOKIE_SESSION_VARIABLE = 'connect.sid'
const configFileService = require('./configFileService')()
async function init({
	httpPort = config.httpServer.port
} = {}) {
	if (configFileService.isConfigFileExisting()) {
		await configFileService.validateFields(config)
	} else await configFileService.generateConfig()
	
	const cookieSession = {
		store: sessionStore,
		secret: config.session.secret, 
		resave: config.session.resave, 
		saveUninitialized: config.session.saveUninitialized,
		cookie: { 
			secure: config.session.cookie.secure,
			maxAge: config.session.cookie.maxAge
		}
	}

	const websocketCookieSession = {
		key: COOKIE_SESSION_VARIABLE,
		secret: config.session.secret,
		store: sessionStore,
		success: (data, accept) => {
			if (config.devPropeties.devMode) logger.debug('New websocket connection estabilished')
			accept()
		},
		fail: (data, msg, err, accept) => {
			if (config.devPropeties.devMode) logger.debug('Failed to connect via websocket connection', msg)
			accept(new Error(err))
		}
	}

	//Express flow

	app.use(bodyParser.json())
	app.use(mongoSanitize())
	app.use(expressSession(cookieSession))
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(router)

	//Passport setting

	const loginStrategy = passportStrategies.loginStrategy()
	passport.serializeUser(loginStrategy.serializeUser)
	passport.deserializeUser(loginStrategy.deserializeUser)

	passport.use(passportStrategyUtils.STRATEGY_NAME, new LocalStrategy({
		usernameField: passportStrategyUtils.FIELDS_NAMES.USERNAME_FIELD,
		passwordField: passportStrategyUtils.FIELDS_NAMES.PASSWORD_FIELD
	}, loginStrategy.validateUser))

	//Initialize http server
	const startHttpServer = httpServer.listen.bind(httpServer)
	const httpServerListening = util.promisify(startHttpServer)(httpPort)
		.then(() => {
			logger.info(`HTTP server is listening on port ${httpPort}`)
			return httpServer
		})
		.catch(err => {
			logger.error(`Error during attempting to listen for port ${httpPort}`)
			return err
		})

	//websocket flow
	io.use(passportSocketIo.authorize(websocketCookieSession))
	initializeWebSocketRouting(io)

	return {
		app,
		passport,
		io,
		httpServerListening,
		dbConnection
	}
}


module.exports = init
