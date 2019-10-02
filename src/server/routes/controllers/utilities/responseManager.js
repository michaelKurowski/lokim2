
const MESSAGES = {
	SUCCESSES : {
		OK : {
			CODE: 200, 
			DESCRIPTION: 'OK'
		}
	},
	ERRORS : {
		BAD_REQUEST : {
			CODE: 400, 
			DESCRIPTION: 'BAD_REQUEST'
		},
		UNAUTHORIZED : {
			CODE: 401, 
			DESCRIPTION: 'UNAUTHORIZED'
		},
		INTERNAL_ERROR : {
			CODE: 500, 
			DESCRIPTION: 'INTERNAL SERVER ERROR'}
	}
}

function sendResponse(res, message, extraPayload) {
	const payload = {
		DESCRIPTION: message.DESCRIPTION,
		extraPayload
	}

	return res.status(message.CODE).json(payload)
}

module.exports = {
	MESSAGES,
	sendResponse
}