const SESSION_ACTION_CODES = require('./session.actions').CODES
const WEBSOCKET_ACTION_CODES = require('../webSocket/webSocket.actions').CODES
const STATES = require('./sessionStates')
const initialState = {
	status: STATES.INITIAL,
	errorMessage: '',
	username: '',
	reason: '',
	isConnectedToRoom: false,
	isConnectedToUsers: false
}

const handleActions = (state = initialState, action = {}) => {
	switch (action.type) {
		case WEBSOCKET_ACTION_CODES.WEBSOCKET_CONNECTION_ESTABILISHED:
			if (action.payload.namespace === 'room') return Object.assign({}, state, {isConnectedToRoom: true})
			if (action.payload.namespace === 'users') return Object.assign({}, state, {isConnectedToUsers: true})
			return state
		case SESSION_ACTION_CODES.LOG_IN_PENDING:
			return Object.assign({}, state, {status: STATES.PENDING, errorMessage: '', username: action.payload.username, reason: ''})
		case SESSION_ACTION_CODES.AUTHORISE:
			return Object.assign({}, state, {status: STATES.SUCCEDED, errorMessage: '', username: action.payload.username, reason: ''})
		case SESSION_ACTION_CODES.DENY_AUTHORISATION:
			return Object.assign({}, state, {status: STATES.FAILED, errorMessage: action.payload.error, username: action.payload.username, reason: action.payload.reason})
		case SESSION_ACTION_CODES.LOG_OUT:
			return initialState
		default:
			return state
	}
}

module.exports = handleActions