const CODES = {
    LOG_IN_PENDING: 'LOG_IN_PENDING',
    AUTHORISE: 'AUTHORISE',
    DENY_AUTHORISATION: 'DENY_AUTHORISATION'
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
    }
}

module.exports = {CODES, actions}