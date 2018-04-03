const passport = require('passport')
const strategyUtils = require('../../../passport/strategyUtils')

function userAuthentication(req, res, next) {
	if(req.isAuthenticated())
		next()
	else {
		const loginStrategyHandler = strategyUtils.strategyHandlers(req, res, next).loginStrategyHandler
		const authenticate = passport.authenticate(strategyUtils.STRATEGY_NAME, loginStrategyHandler) 
		authenticate(req, res, next)
	}
				
}

module.exports = userAuthentication