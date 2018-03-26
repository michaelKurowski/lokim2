const findUserCallback = require('./findUserCallback')

function passportLoginStrategy(UserModel = require('../models/user')) {
	return {
		StrategyCallback: (username, password, done) => {
		
			const index = {
				username
			}
			const findUser = findUserCallback(username, password, done)
			UserModel.findOne(index).exec()
				.then((user) => findUser.thenCallback(user))
				.catch(err => findUser.catchCallback(err))
		
			
		},


		serializeUserCallback: function (user, done) {
			done(null, user.id)
		},


		deserializeUserCallback: function (id, done) {
			UserModel.findById(id, (err, user) => {
				done(err, user)
			})
		}
	}
}

module.exports = {
	loginStrategy: passportLoginStrategy
}