module.exports = class Response {
    constructor(action, payload) {
        this.action = action
        this.payload = payload
        this.date = (new Date()).getTime()
    }

    serialize() {
        return {
            action: this.action,
            payload: this.payload,
            date: this.date
        }
    }
}