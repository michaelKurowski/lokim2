const logInUtilities = require('./utilities/logInUtilities')
const strategyUtils = require('../../passport/strategyUtils')

function logIn(passport = require('passport')) {
	return (req, res, next) => {
		const proceedLogIn = logInUtilities(req, res, next).proceedLogIn
		const logInByPassport = passport.authenticate(strategyUtils.STRATEGY_NAME, proceedLogIn) 
		logInByPassport(req, res, next)
	}
}

module.exports = logIn