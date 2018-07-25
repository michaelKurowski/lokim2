const {call, takeEvery, put} = require('redux-saga/effects')
const {CODES, actions} = require('../session/session.actions')
const storeProvider = require('../../storeProvider')
const ENDPOINTS = require('../../routes/routes.json').urls
const LOG_IN_SUCCESS = 200
const LOG_IN_FAIL = 401
const POST_HTTP_METHOD = 'POST'
const HTTP_CREDENTIALS = 'same-origin'
const headers = { 
    'Content-Type': 'application/json'
}
const AUTHORISATION_DENY_REASONS = {
    WRONG_CREDENTIALS: 'WRONG_CREDENTIALS',
    UNEXPECTED_SERVER_ERROR: 'UNEXPECTED_SERVER_ERROR'
}

function* watchLogIn() {
    yield takeEvery(CODES.LOG_IN_PENDING, logIn)
}

function* logIn(action) {
    const {dispatch} = storeProvider.get()
    const credentials = action.payload
    const authorisationResponse = yield call(
        fetch,
        ENDPOINTS.LOGIN,
        {
            method: POST_HTTP_METHOD,
            headers,
            credentials: HTTP_CREDENTIALS,
			body: JSON.stringify({username: credentials.username, password: credentials.password})
        }
    )

    switch (authorisationResponse.status) {
        case LOG_IN_SUCCESS:
            put(dispatch(actions.authorise(credentials.username)))
            break
        case LOG_IN_FAIL:
            put(dispatch(actions.denyAuthorisation(credentials.username, AUTHORISATION_DENY_REASONS.WRONG_CREDENTIALS, authorisationResponse)))
            break
        default:
            put(dispatch(actions.denyAuthorisation(credentials.username, AUTHORISATION_DENY_REASONS.UNEXPECTED_SERVER_ERROR, authorisationResponse)))
    }
}

module.exports = {
    logIn,
    watchLogIn
}