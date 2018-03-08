const dbConnection = require('../dbConnection')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema

const REQUIRED_PARAM_DESC = 'This param is required'
const DUPLICATE_KEY_ERROR_DESC = 'There was a duplicate key'


const userSchema = new Schema({
	username:{ 
		type: String,
		required: REQUIRED_PARAM_DESC,
		unique: true
	},
	email:{ 
		type: String,
		required: REQUIRED_PARAM_DESC,
		unique: true
	},
	password:{ 
		type: String,
		required: REQUIRED_PARAM_DESC,
	}, 
	salt:{
		type: String
	}
})

userSchema.plugin(uniqueValidator, { message: DUPLICATE_KEY_ERROR_DESC })
const UserModel = dbConnection.model('users', userSchema)

module.exports = UserModel