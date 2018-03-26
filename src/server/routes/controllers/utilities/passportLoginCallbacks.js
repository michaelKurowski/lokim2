const logger = require('../../../logger')
const Utilities = require('../../../utilities')
const statusCodes = require('./statusCodes')
const msg = require('./responseMessages')

function authenticateCallback(req, res) {
	
	return (err, user, info) => {

		if(err) {
			switch(err) {
			case msg.errors.UNAUTHORIZED: 
				
				return res.status(statusCodes.UNAUTHORIZED)
					.json(Utilities.createMessage(msg.errors.UNAUTHORIZED)) 
			

			case msg.errors.BAD_REQUEST:
				return res.status(statusCodes.BAD_REQUEST)
					.json(Utilities.createMessage(msg.errors.BAD_REQUEST)) 
					
			default:

				return res.status(statusCodes.INTERNAL_SERVER)
					.json(Utilities.createMessage(msg.errors.INTERNAL_SERVER)) 
			}
		}
		
		req.logIn(user, logInCallback(res))
	}
}

function logInCallback(res) {
	return err => {
		if (err) { 
			logger.error(err) 
			return res.status(statusCodes.INTERNAL_SERVER)
				.json(Utilities.createMessage(msg.errors.INTERNAL_SERVER))
		}
		return res.status(statusCodes.OK)
			.json(Utilities.createMessage(msg.successes.LOGGED_USER))
	}
}



module.exports = {
	authenticateCallback,
	logInCallback
}