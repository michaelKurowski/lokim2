const ACTION_CODES = require('./findUsers.actions').CODES

const initialState = {
	usersFound: []
}
const handleActions = (state = initialState, action = {}) => {
	switch (action.type) {
		case ACTION_CODES.USERS_FOUND:
			return setFoundUsers(state, action.payload)
		default:
			return state
	}
}

function setFoundUsers(state, payload) {
	return Object.assign({}, state, {usersFound: payload.usernames})
}

module.exports = handleActions