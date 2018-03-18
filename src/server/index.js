const express = require('express')
const router = require('./routes/router')
const bodyParser = require('body-parser')
const config = require('./config.json')
const app = express()
const logger = require('./logger.js')

const passport = require('passport')
const expressSession = require('express-session')
const MongoSessionStore = require('connect-mongo')(expressSession)

const dbConnection = require('./dbConnection')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

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

app.use(router)

app.listen(config.httpServer.port, (err) => {
	if (err) {
		logger.error(`Error during attempting to listen for port ${config.httpServer.port}`)
		return
	}
	logger.info(`HTTP server is listening on port ${config.httpServer.port}`)
})
