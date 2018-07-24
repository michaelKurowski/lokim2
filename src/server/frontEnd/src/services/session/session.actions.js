const ENDPOINTS = require('../../routes/routes.json').urls


const CODES = {
    LOG_IN_PENDING: 'LOG_IN_PENDING',
    LOG_IN_SUCCESS: 'LOG_IN_SUCCESS',
    LOG_IN_FAILED: 'LOG_IN_FAILED'
}

const LOG_IN_RESPONSES = {
    SUCCESS: 'SUCCESS',
    WRONG_CREDENTIALS: 'WRONG_CREDENTIALS',
    UNEXPECTED_SERVER_ERROR: 'UNEXPECTED_SERVER_ERROR'
}
const LOG_IN_SUCCESS = 200
const LOG_IN_FAIL = 401
const POST_HTTP_METHOD = 'POST'
const HTTP_CREDENTIALS = 'same-origin'
const headers = { 
    'Content-Type': 'application/json'
}

const actions = {
    logIn: credentials => dispatch => {
        dispatch({type: CODES.LOG_IN_PENDING, payload: {}})
		return fetch(ENDPOINTS.LOGIN, {
			method: POST_HTTP_METHOD, headers, credentials: HTTP_CREDENTIALS,
			body: JSON.stringify({username: credentials.username, password: credentials.password})
        })
        .then(response => {
			switch (response.status) {
                case LOG_IN_SUCCESS:
                    dispatch({type: CODES.LOG_IN_SUCCESS, payload: {response: LOG_IN_RESPONSES.SUCCESS, username: credentials.username}})
					break
				case LOG_IN_FAIL:
                    dispatch({type: CODES.LOG_IN_FAILED, payload: {response: LOG_IN_RESPONSES.WRONG_CREDENTIALS, username: credentials.username}})
					break
                default:
                    dispatch({type: CODES.LOG_IN_FAILED, payload: {
                        response: LOG_IN_RESPONSES.UNEXPECTED_SERVER_ERROR,
                        error: `Unpexpected http request code: ${response.status}`,
                        username: credentials.username
                    }})
			}
        }).catch(error => {
            dispatch({type: CODES.LOG_IN_FAILED, payload: {
                response: LOG_IN_RESPONSES.UNEXPECTED_SERVER_ERROR,
                error
            }})
        })

    }
}

module.exports = {CODES, actions}