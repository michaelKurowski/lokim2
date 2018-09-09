const mongoose = require('mongoose')
const Schema = mongoose.Schema

const notificationSchema = new Schema( {
	username: {
		type: String
	},
	notificationType: {
		type: String
	}
})

const NotificationModel = mongoose.model('notifications', notificationSchema)
module.exports = NotificationModel
