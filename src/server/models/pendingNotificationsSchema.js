const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pendingNotificationsSchema = new Schema( {
	username: {
		type: String
	},
	notificationType: {
		type: String
	}
})

module.exports = pendingNotificationsSchema
