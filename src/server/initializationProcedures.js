const util = require('util')

module.exports = {
	initializeConfig,
	createCookiesHttpSessionConfigObject,
	createCookiesWebsocketSessionConfigObject,
	initializeHttpRequestProcessingFlow,
	initializeWebSocketEventProcessingFlow,
	initializeHttpServer,
	initializePassport
}

async function initializeConfig({
	configFileService = require('./configFileService')()
} = {}) {
	const isConfigExisting = await configFileService.isConfigFileExisting()
	if (!isConfigExisting) {
		await configFileService.generateConfig()
		const logger = require('./logger')
		logger.info('No config file found, new config generated. Please fill it.')
	}
	
	configFileService.validateFields(require('./config.json'))
}

function createCookiesHttpSessionConfigObject(globalConfigFile, sessionStore) {
	return {
		store: sessionStore,
		secret: globalConfigFile.session.secret, 
		resave: globalConfigFile.session.resave, 
		saveUninitialized: globalConfigFile.session.saveUninitialized,
		cookie: { 
			secure: globalConfigFile.session.cookie.secure,
			maxAge: globalConfigFile.session.cookie.maxAge
		}
	}
}

function createCookiesWebsocketSessionConfigObject(globalConfigFile, sessionStore, {
	logger = require('./logger')
} = {}) {
	const devMode = globalConfigFile.devPropeties.devMode
	return {
		key: globalConfigFile.session.cookieName,
		secret: globalConfigFile.session.secret,
		store: sessionStore,
		success: (data, accept) => {
			if (devMode) logger.debug('New websocket connection estabilished')
			accept()
		},
		fail: (data, msg, err, accept) => {
			if (devMode) logger.debug('Failed to connect via websocket connection', msg)
			accept(new Error(err))
		}
	}
}

function initializeHttpRequestProcessingFlow(app, router, cookieHttpSessionConfig, {
	cors = require('cors'),
	bodyParser = require('body-parser'),
	mongoSanitize = require('express-mongo-sanitize'),
	expressSession = require('express-session'),
	passport = require('passport')
} = {}) {
	app.use(cors({credentials: true, origin: 'http://localhost:3000'}))
	app.use(bodyParser.json())
	app.use(mongoSanitize())
	app.use(expressSession(cookieHttpSessionConfig))
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(router)
}

function initializeWebSocketEventProcessingFlow(httpServer, cookieWebsocketSessionConfig, {
	passportSocketIo = require('passport.socketio'),
	webSocketRouting = require('./ws-routes/webSocketRouting')
} = {}) {
	const io = require('socket.io')(httpServer, {path: '/connection'})
	io.use(passportSocketIo.authorize(cookieWebsocketSessionConfig))
	webSocketRouting.initializeWebSocketRouting(io)
}

function initializePassport({
	passport = require('passport'),
	passportStrategies = require('./passport/strategies'),
	passportStrategyUtils = require('./passport/strategyUtils'),
	LocalStrategy = require('passport-local').Strategy
} = {}) {
	const loginStrategy = passportStrategies.loginStrategy()
	passport.serializeUser(loginStrategy.serializeUser)
	passport.deserializeUser(loginStrategy.deserializeUser)

	passport.use(passportStrategyUtils.STRATEGY_NAME, new LocalStrategy({
		usernameField: passportStrategyUtils.FIELDS_NAMES.USERNAME_FIELD,
		passwordField: passportStrategyUtils.FIELDS_NAMES.PASSWORD_FIELD
	}, loginStrategy.validateUser))
}

function initializeHttpServer(httpServer, httpPort, {
	logger = require('./logger')
} = {}) {
	const startHttpServer = httpServer.listen.bind(httpServer)
	return util.promisify(startHttpServer)(httpPort)
		.then(() => {
			logger.info(`HTTP server is listening on port ${httpPort}`)
			return httpServer
		})
		.catch(err => {
			logger.error(`Error during attempting to listen for port ${httpPort}`)
			return err
		})
}