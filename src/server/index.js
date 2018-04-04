const express = require('express')
const router = require('./routes/router')
const bodyParser = require('body-parser')
const config = require('./config.json')
const app = express()
const logger = require('./logger.js')

const passport = require('passport')
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)
const mongoSanitize = require('express-mongo-sanitize')

const dbConnection = require('./dbConnection')
const passportStrategies = require('./passport/strategies')
const passportStrategyUtils = require('./passport/strategyUtils')
const LocalStrategy = require('passport-local').Strategy

app.use(bodyParser.json())
app.use(mongoSanitize())

app.use(expressSession({ 
	store: new MongoSessionStore({ mongooseConnection: dbConnection} ),
	secret: config.session.secret, 
	resave: config.session.resave, 
	saveUninitialized: config.session.saveUninitialized,
	cookie: { 
		secure: config.session.cookie.secure,
		expires: new Date(Date.now() + config.session.cookie.expires),
		maxAge: new Date(Date.now() + config.session.cookie.expires)
	} }))

app.use(passport.initialize())
app.use(passport.session())

const loginStrategy = passportStrategies.loginStrategy()
passport.serializeUser(loginStrategy.serialzeUser)
passport.deserializeUser(loginStrategy.deserializeUser)

passport.use(passportStrategyUtils.STRATEGY_NAME, new LocalStrategy({
	usernameField: passportStrategyUtils.FIELDS_NAMES.USERNAME_FIELD,
	passwordField: passportStrategyUtils.FIELDS_NAMES.PASSWORD_FIELD
}, loginStrategy.validateUser))

app.use(router)

app.listen(config.httpServer.port, (err) => {
	if (err) {
		logger.error(`Error during attempting to listen for port ${config.httpServer.port}`)
		return
	}
	logger.info(`HTTP server is listening on port ${config.httpServer.port}`)
})
