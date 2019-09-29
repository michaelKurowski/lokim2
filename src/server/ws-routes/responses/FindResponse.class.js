const namespaceInfo =  require('../../protocol/protocol.json').room

const Request = require('./Response.class')

module.exports = class FindResponse extends Request {
	constructor(usernames) {
		super(namespaceInfo.eventTypes.FIND)
		this.payload = {
			usernames
		}
	}
}