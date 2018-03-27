const passportUtils = require('./passportUtils')

function passportLoginStrategy(UserModel = require('../models/user')) {
	return {
		strategyCallback: (username, password, done) => {
		
			const index = {
				username
			}
			const findUser = passportUtils.handleFindUser(username, password, done)
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