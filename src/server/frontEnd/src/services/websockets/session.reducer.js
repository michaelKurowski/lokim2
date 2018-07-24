const ACTION_CODES = require('./session.actions').CODES
const STATES = require('./sessionStates')
const initialState = {
    status: '',
    errorMessage: ''
}

const handleActions = (state = initialState, action = {}) => {
    switch (action.type) {
        case ACTION_CODES.LOG_IN_PENDING:
            return Object.assign({}, state, {status: STATES.PENDING, errorMessage: ''})
        case ACTION_CODES.LOG_IN_SUCCESS:
            return Object.assign({}, state, {status: STATES.SUCCEDED})
        case ACTION_CODES.LOG_IN_FAILED:
            return Object.assign({}, state, {status: STATES.FAILED, errorMessage: action.payload.error})
        default:
            return state
    }
}

module.exports = handleActions