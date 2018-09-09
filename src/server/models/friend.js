const mongoose = require('mongoose')
const Schema = mongoose.Schema

const friendSchema = new Schema({
	username: {
		type: String
	}
	
}, {_id:false})

const FriendModel = mongoose.model('friends', friendSchema)
module.exports = FriendModel
