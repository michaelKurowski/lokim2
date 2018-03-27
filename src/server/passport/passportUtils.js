const Utilities = require('../utilities')
const msg = require('../routes/controllers/utilities/responseMessages')
const logger = require('../logger')

function handleFindUser(username, password, done) {
	return {
		thenCallback: user => {
			const hash = Utilities.createSaltedHash(user.salt, password)
			
			if (hash == user.password) {
				return done(null, user)
			}
			return done(msg.errors.UNAUTHORIZED, null, {message: msg.errors.UNAUTHORIZED_ACCESS})
		},

		catchCallback: err => {
			logger.error(err)
			return done(msg.errors.BAD_REQUEST, null, {message: msg.errors.BAD_REQUEST})
		}
	}
}

module.exports = {handleFindUser}