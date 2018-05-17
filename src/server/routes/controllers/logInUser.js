const strategyUtils = require('../../passport/strategyUtils')

function logIn(passport = require('passport')) {
	return (req, res, next) => {
		const loginStrategyHandler = strategyUtils.strategyHandlers(req, res, next).loginStrategyHandler
		const logInByPassport = passport.authenticate(strategyUtils.STRATEGY_NAME, loginStrategyHandler) 
		logInByPassport(req, res, next)
	}
}

module.exports = logIn