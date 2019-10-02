const namespaceInfo =  require('../../protocol/protocol.json').room

const Request = require('./Response.class')

module.exports = class MessageResponse extends Request {
	constructor(author, roomId, text, date) {
		super(namespaceInfo.eventTypes.MESSAGE)
		this.payload = {
			author,
			roomId,
			text
		}
		if (date) this.date = date
	}
}