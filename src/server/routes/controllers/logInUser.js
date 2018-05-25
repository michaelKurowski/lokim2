const initializeLoginHandler = require('./utilities/initializeLoginHandler')
const strategyUtils = require('../../passport/strategyUtils')

function logIn(passport = require('passport')) {
	return (req, res, next) => {
		const loginHandler = initializeLoginHandler(req, res, next)
		const logInByPassport = passport.authenticate(strategyUtils.STRATEGY_NAME, loginHandler) 
		logInByPassport(req, res, next)
	}
}

module.exports = logIn