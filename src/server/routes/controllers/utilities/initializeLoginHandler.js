const responseManager = require('./responseManager')

function initializeLoginHandlers(req, res) {
	const isSuccessfullyLoggedIn = (err) => {
		if (err) return responseManager.sendResponse(res, err)
		
		return responseManager.sendResponse(res, responseManager.MESSAGES.SUCCESSES.OK)
	}

	const loginHandler = (err, user) => {
		if (err)
			return responseManager.sendResponse(res, err)

		if (user)	
			req.logIn(user, isSuccessfullyLoggedIn)
		else
			return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)
	}

	return loginHandler		
}

module.exports = initializeLoginHandlers