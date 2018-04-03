const passport = require('passport')
const strategyUtils = require('../../../passport/strategyUtils')

function userAuthentication(req, res, next) {
	if(req.isAuthenticated())
		next()
	else
		passport.authenticate(strategyUtils.STRATEGY_NAME, 
			strategyUtils.strategyHandlers(req, res, next).loginStrategyHandler) (req, res, next)
}

module.exports = userAuthentication