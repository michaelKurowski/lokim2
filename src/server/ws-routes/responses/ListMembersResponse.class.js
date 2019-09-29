const namespaceInfo =  require('../../protocol/protocol.json').room

const Request = require('./Response.class')

module.exports = class ListMembersResponse extends Request {
	constructor(usernames, roomId) {
		super(namespaceInfo.eventTypes.LIST_MEMBERS)
		this.payload = {
			usernames,
			roomId
		}
	}
}