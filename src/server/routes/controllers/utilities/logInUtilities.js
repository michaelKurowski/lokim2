const responseManager = require('./responseManager')

function LogInUtilities(req, res) {
	const isSuccessfullyLoggedIn = (err) => {
		if (err) return responseManager.sendResponse(res, err)
		
		return responseManager.sendResponse(res, responseManager.MESSAGES.successes.OK)
	}

	const proceedLogIn = (err, user) => {
		if (err)
			return responseManager.sendResponse(res, err)

		if (user)	
			req.logIn(user, isSuccessfullyLoggedIn)
		else
			return responseManager.sendResponse(res, responseManager.MESSAGES.errors.BAD_REQUEST)
	}

	return {
		isSuccessfullyLoggedIn,
		proceedLogIn
	}		
}

module.exports = LogInUtilities