const namespaceInfo =  require('../../protocol/protocol.json').users
const EVENT_TYPES = namespaceInfo.eventTypes
const logger = require('../../logger')
const _ = require('lodash')
const FindResponse = require('../responses/FindResponse.class')

/**
 * /Users websocket namespace and its events
 * @namespace
 */
class Users {
	constructor({
		UserModel = require('../../models/user')
	} = {}) {
		this.UserModel = UserModel
	}

	/** User queries for another user
	 * @name find
	 * @memberof Users
	 * @member
	 * @property {string} queryPhrase Phrase to match with usernames
	 * @property {string[]} foundUsernames Found usernames beginning with query phrase
	 */
	[EVENT_TYPES.FIND](data, socket) {
		const {queryPhrase} = data
		if (!queryPhrase) return socket.emit(EVENT_TYPES.FIND, {foundUsernames: []})
		const usernameToMatch = `^${queryPhrase}`
		const USERNAME_DB_FIELD = 'username'
		const query = {username: new RegExp(usernameToMatch)}
		return this.UserModel.find(query, USERNAME_DB_FIELD).exec()
			.then(users => {
				const foundUsernames = _.map(users, user => user.username)
				const response = new FindResponse(foundUsernames)
				socket.emit(EVENT_TYPES.FIND, response.serialize())
			}).catch(err => {
				logger.error(err)
			})
	}
}

module.exports = Users