
const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../models/user')
const Utilities = require('../utilities')
const msg = require('../routes/controllers/utilities/responseMessages')
const logger = require('../logger')

const Strategy = new LocalStrategy({
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
			return done(msg.errors.UNAUTHORIZED, false, {message: msg.errors.UNAUTHORIZED_ACCESS})
		})
		.catch(err => {
			logger.error(err)
			return done(msg.errors.INTERNAL_SERVER, false, {message: msg.errors.INTERNAL_SERVER})
		})

	
})

const serialize = function (user, done) {
	done(null, user.id)
} 

const deserialize = function (id, done) {
	UserModel.findById(id, (err, user) => {
		done(err, user)
	})
}

module.exports = {
	loginStrategy: Strategy,
	serializeUser: serialize,
	deserializeUser: deserialize
}