const dbConnection = require('../dbConnection')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pendingEventsSchema = new Schema({
	username:{
		type: String,
		required: true,
		unique: true
	},
	events:[{
		username:{
			type: String,
			required: true,
			unique: true
		},
		eventType:{
			type: String,
			required: true
		}
	}]

})

const PendingEventsModel = dbConnection.model('pendingEvents', pendingEventsSchema)

module.exports = PendingEventsModel