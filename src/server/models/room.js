const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const Schema = mongoose.Schema


const roomSchema = new Schema({
	name:{ 
		type: String,
		required: true
	},
	members:{ 
		type: [String],
		required: true
	}
})

const RoomModel = dbConnection.model('rooms', roomSchema)

module.exports = RoomModel