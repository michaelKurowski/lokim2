const namespaceInfo =  require('../../protocol/protocol.json').room

const Request = require('./Response.class')

module.exports = class LeaveResponse extends Request {
    constructor(username, roomId) {
        super(namespaceInfo.eventTypes.LEAVE)
        this.payload = {
            username,
            roomId
        }
    }
}