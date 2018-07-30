const CODES = {
    LOG_IN_PENDING: 'LOG_IN_PENDING',
    AUTHORISE: 'AUTHORISE',
    DENY_AUTHORISATION: 'DENY_AUTHORISATION',
    LOG_OUT: 'LOG_OUT'
}

const actions = {
    logIn: credentials => {
        return {type: CODES.LOG_IN_PENDING, payload: credentials}
    },
    authorise(username) {
        return {type: CODES.AUTHORISE, payload: {username}}
    },
    denyAuthorisation(username, reason, response) {
        return {
            type: CODES.DENY_AUTHORISATION,
            payload: {
                reason,
                response,
                username
            }
        }
    },
    logOut() {
        return {type: CODES.LOG_OUT, payload: {}}
    }
}

module.exports = {CODES, actions}