const strategyUtils = require('../../../passport/strategyUtils')

function logInUser(passport = require('passport')) {
	return (req, res, next) => {
		if(req.isAuthenticated())
			next()
		else {
			const loginStrategyHandler = strategyUtils.strategyHandlers(req, res, next).loginStrategyHandler
			const authenticationMiddleware = passport.authenticate(strategyUtils.STRATEGY_NAME, loginStrategyHandler) 
			authenticationMiddleware(req, res, next)
		}
	}	
}

module.exports = logInUser