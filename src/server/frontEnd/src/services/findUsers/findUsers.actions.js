const CODES = {
	FIND_USER: 'FIND_USER',
	USERS_FOUND: 'USERS_FOUND'
}
const actions = {
	findUser,
	usersFound
}

function findUser(username) {
	return {type: CODES.FIND_USER, payload: {username}}
}

function usersFound(usernames) {
	return {type: CODES.USERS_FOUND, payload: {usernames}}
}

module.exports = {CODES, actions}