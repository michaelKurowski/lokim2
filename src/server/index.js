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

const dbConnection = require('./dbConnection')
const passportStrategies = require('./passport/strategies')
const passportStrategyUtils = require('./passport/strategyUtils')
//const expressSetup = require('./expressSetup')

const LocalStrategy = require('passport-local').Strategy
const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
const COOKIE_SESSION_VARIABLE = 'connect.sid'
/*
function init() {
	
	return {
		app,
		passport,
		io,
		httpServer,
		dbConnection
	}
}
*/
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
passport.serializeUser(loginStrategy.serialzeUser)
passport.deserializeUser(loginStrategy.deserializeUser)

passport.use(passportStrategyUtils.STRATEGY_NAME, new LocalStrategy({
	usernameField: passportStrategyUtils.FIELDS_NAMES.USERNAME_FIELD,
	passwordField: passportStrategyUtils.FIELDS_NAMES.PASSWORD_FIELD
}, loginStrategy.validateUser))

//Initialize http server

httpServer.listen(config.httpServer.port, (err) => {
	if (err) {
		logger.error(`Error during attempting to listen for port ${config.httpServer.port}`)
		return
	}
	logger.info(`HTTP server is listening on port ${config.httpServer.port}`)
})

//websocket flow

io.use(passportSocketIo.authorize(websocketCookieSession))
initializeWebSocketRouting(io)

module.exports = {
	app,
	passport,
	io,
	httpServer,
	dbConnection
}
