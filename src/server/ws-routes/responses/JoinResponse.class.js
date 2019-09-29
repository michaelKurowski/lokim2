const namespaceInfo =  require('../../protocol/protocol.json').room

const Request = require('./Response.class')

module.exports = class JoinResponse extends Request {
    constructor(username, roomId) {
        super(namespaceInfo.eventTypes.JOIN)
        this.payload = {
            username,
            roomId
        }
    }
}