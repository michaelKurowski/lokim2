const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const messageSchema = new Schema({
	author:{ 
		type: String,
		required: true,
		unique: true
	},
	text:{ 
		type: String,
		required: true
	},
	roomId:{ 
		type: String,
		required: true
	}, 
	date: {
		type: Number
	}
})

const MessageModel = dbConnection.model('messages', messageSchema)

module.exports = MessageModel