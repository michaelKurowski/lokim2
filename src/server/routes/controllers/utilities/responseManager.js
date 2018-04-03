
const CODES = {
	successes : {
		OK : [200, 'OK']
	},
	errors : {
		BAD_REQUEST : [400, 'BAD_REQUEST'],
		UNAUTHORIZED : [401, 'UNAUTHORIZED'],
		INTERNAL_ERROR : [500, 'INTERNAL SERVER ERROR']
	}
}

function createResponse(res, code, extraPayload) {
	const payload = {
		description: code[1],
		extraPayload
	}

	return res.status(code[0]).json(payload)
}

module.exports = {
	CODES,
	createResponse
}