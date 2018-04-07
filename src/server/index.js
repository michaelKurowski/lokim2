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
const LocalStrategy = require('passport-local').Strategy
const path = require('path')
const sessionStore = new MongoSessionStore({ mongooseConnection: dbConnection} )
app.use(bodyParser.json())
app.use(mongoSanitize())

app.use(expressSession({
	store: sessionStore,
	secret: config.session.secret, 
	resave: config.session.resave, 
	saveUninitialized: config.session.saveUninitialized,
	cookie: { 
		secure: config.session.cookie.secure,
		maxAge: config.session.cookie.maxAge
	}})
)

app.use(passport.initialize())
app.use(passport.session())

const loginStrategy = passportStrategies.loginStrategy()
passport.serializeUser(loginStrategy.serialzeUser)
passport.deserializeUser(loginStrategy.deserializeUser)

passport.use(passportStrategyUtils.STRATEGY_NAME, new LocalStrategy({
	usernameField: passportStrategyUtils.FIELDS_NAMES.USERNAME_FIELD,
	passwordField: passportStrategyUtils.FIELDS_NAMES.PASSWORD_FIELD
}, loginStrategy.validateUser))

if (config.devMode) app.use('/test', express.static(path.join(__dirname, '/.tests/tools')))
app.use(router)

httpServer.listen(config.httpServer.port, (err) => {
	if (err) {
		logger.error(`Error during attempting to listen for port ${config.httpServer.port}`)
		return
	}
	logger.info(`HTTP server is listening on port ${config.httpServer.port}`)
})

io.set('authorization', passportSocketIo.authorize({
	key: 'connect.sid',
	secret: config.session.secret,
	store: sessionStore,
	success: (data, accept) => accept(null, true),
	fail: (data, msg, err) => {}
}))

initializeWebSocketRouting(io)
