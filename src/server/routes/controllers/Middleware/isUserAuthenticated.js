const responseManager = require('../utilities/responseManager')

function isAuthenticated() {
	return (req, res, next) => {
		const isAlreadyLoggedIn = req.isAuthenticated()
		if(!isAlreadyLoggedIn) 
			return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.UNAUTHORIZED)
		
		next()
	}	
}

module.exports = isAuthenticated