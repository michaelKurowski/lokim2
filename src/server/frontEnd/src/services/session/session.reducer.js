const ACTION_CODES = require('./session.actions').CODES
const STATES = require('./sessionStates')
const initialState = {
    status: '',
    errorMessage: '',
    username: '',
    reason: ''
}

const handleActions = (state = initialState, action = {}) => {
    console.log(action)
    switch (action.type) {
        case ACTION_CODES.LOG_IN_PENDING:
            return Object.assign({}, state, {status: STATES.PENDING, errorMessage: '', username: action.payload.username, reason: ''})
        case ACTION_CODES.AUTHORISE:
            return Object.assign({}, state, {status: STATES.SUCCEDED, errorMessage: '', username: action.payload.username, reason: ''})
        case ACTION_CODES.DENY_AUTHORISATION:
            return Object.assign({}, state, {status: STATES.FAILED, errorMessage: action.payload.error, username: action.payload.username, reason: action.payload.reason})
        default:
            return state
    }
}

module.exports = handleActions