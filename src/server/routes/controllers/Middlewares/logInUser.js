const strategyUtils = require('../../../passport/strategyUtils')

function logInUser(passport = require('passport')) {
	return (req, res, next) => {
		const isAlreadyLoggedIn = req.isAuthenticated()
		if(isAlreadyLoggedIn)
			next()
		else {
			const loginStrategyHandler = strategyUtils.strategyHandlers(req, res, next).loginStrategyHandler
			const logInByPassport = passport.authenticate(strategyUtils.STRATEGY_NAME, loginStrategyHandler) 
			logInByPassport(req, res, next)
		}
	}	
}

module.exports = logInUser