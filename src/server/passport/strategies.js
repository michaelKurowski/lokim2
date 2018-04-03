const strategyUtils = require('./strategyUtils')
const UserModel = require('../models/user')

const loginStrategy = (username, password, done) => {
	const index = {
		username
	}
	
	const findUserHandler = strategyUtils.findUserHandler(username, password, done)
	UserModel.findOne(index).exec()
		.then(findUserHandler.foundUser)
		.catch(findUserHandler.userNotFound)

	
}

const serialzeUser = (user, done) => done(null, user.id)

const deserializeUser = (id, done) => {
	UserModel.findById(id, (err, user) => {
		done(err, user)
	})
}

module.exports = {
	loginStrategy,
	serialzeUser,
	deserializeUser
}