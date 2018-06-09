const cors = require('cors')
const express = require('express')
const app = express()
const httpServer = require('http').Server(app)
const bodyParser = require('body-parser')

const io = require('socket.io')(httpServer, {path: '/connection'})
const passport = require('passport')
const passportSocketIo = require('passport.socketio')
const expressSession = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const mongoSanitize = require('express-mongo-sanitize')
const util = require('util')
const MongoSessionStore = require('connect-mongo')(expressSession)
let logger
async function init({
	httpPort
} = {}) {

	const configFileService = require('./configFileService')()
	const isConfigExisting = await configFileService.isConfigFileExisting()
	if (isConfigExisting) {
		configFileService.validateFields(require('./config.json'))
		logger = require('./logger')
	} else {
		await configFileService.generateConfig()
		logger = require('./logger')
		logger.info('No config file found, new config generated. Please fill it.')
		configFileService.validateFields(require('./config.json'))
		
	}
	const config = require('./config.json')
	httpPort = process.env.PORT || httpPort || config.httpServer.port
	const router = require('./routes/router')
	const webSocketRouting = require('./ws-routes/webSocketRouting')
	const passportStrategies = require('./passport/strategies')
	const passportStrategyUtils = require('./passport/strategyUtils')
	const dbConnection = require('./dbConnection')
	const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
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
		key: config.session.cookieName,
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
	app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
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
	webSocketRouting.initializeWebSocketRouting(io)

	return {
		app,
		passport,
		io,
		httpServerListening,
		dbConnection
	}
}


module.exports = init
