const namespaceInfo =  require('../../protocol/protocol.json').room

const Request = require('./Response.class')

module.exports = class MessageResponse extends Request {
    constructor(author, roomId, text) {
        super(namespaceInfo.eventTypes.MESSAGE)
        this.payload = {
            author,
            roomId,
            text
        }
    }
}