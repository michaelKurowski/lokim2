
function init(
	httpServer,
	cookieSession,
	router,
	express = require('express'),
	bodyParser = require('body-parser'),
	passport =  require('passport'),
	mongoSanitize = require('express-mongo-sanitize'),
	expressSession = require('express-session'))
{
	const app = express()
	app.use(bodyParser.json())
	app.use(mongoSanitize())
	app.use(expressSession(cookieSession))
	app.use(passport.initialize())
	app.use(passport.session())
	app.use(router)
}


module.exports = init