const mongoose = require('mongoose')
const Schema = mongoose.Schema

const friendsSchema = new Schema({
	username: {
		type: String
	}
	
}, {_id:false})
module.exports = friendsSchema