const express = require('express')
const router = express.Router()
const logger = require('../logger')
const UserModel = require('../models/user')
const Utilities = require('../utilities')
const statusCodes = require('./utilities/statusCodes')
const msg = require('./utilities/messages')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const LOGIN_STRATEGY = 'loginStratefy'

router.post('/', (req, res, next) => {
	
	if(req.isAuthenticated()) {
		return res.status(statusCodes.OK).send(msg.Success.LOGGED_USER)
	}

	passport.authenticate(LOGIN_STRATEGY, function(err, user, info) {

		if (!user) { 
			res.status(statusCodes.UNAUTHORIZED)
			return res.send(Utilities.createError(msg.Errors.UNAUTHORIZED_ACCESS)) }
		
		req.logIn(user, function(err) {
			if (err) { 
				logger.error(err) 
				res.status(statusCodes.INTERNAL_SERVER)
				return res.send(Utilities.createError(msg.Errors.INTERNAL_SERVER))
			}
			return res.status(statusCodes.OK).send(msg.Success.LOGGED_USER)
		})
	})(req, res, next)
})

passport.serializeUser( (user, done) => {
	done(null, user.id)
} )

passport.deserializeUser( (id, done) => {
	UserModel.findById(id, (err, user) => {
		done(err, user)
	})
})

passport.use(LOGIN_STRATEGY, new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password'
}, 
(username, password, done) => {

	const index = {
		username
	}

	UserModel.findOne(index).exec()
		.then( (user) => {
			const hash = Utilities.createSaltedHash(user.salt, password)

			if (hash == user.password) {
				return done(null, user)
			}

			return done(null, false, {message: msg.Errors.UNAUTHORIZED_ACCESS})
		})
		.catch(err => {
			logger.error(err)
			return done(null, false, {message: msg.Errors.INTERNAL_SERVER})
		})

	
}))


module.exports = router