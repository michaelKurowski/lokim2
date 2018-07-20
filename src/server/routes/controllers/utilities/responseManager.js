
const MESSAGES = {
	SUCCESSES : {
		OK : {
			code: 200, 
			description: 'OK'
		}
	},
	ERRORS : {
		BAD_REQUEST : {
			code: 400, 
			description: 'BAD_REQUEST'
		},
		UNAUTHORIZED : {
			code: 401, 
			description: 'UNAUTHORIZED'
		},
		INTERNAL_ERROR : {
			code: 500, 
			description: 'INTERNAL SERVER ERROR'}
	}
}

function sendResponse(res, message, extraPayload) {
	const payload = {
		description: message.description,
		extraPayload
	}

	return res.status(message.code).json(payload)
}

module.exports = {
	MESSAGES,
	sendResponse
}