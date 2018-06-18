const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema

const DUPLICATE_KEY_ERROR_DESC = 'There was a duplicate key'


const userSchema = new Schema({
	username:{ 
		type: String,
		required: true,
		unique: true
	},
	email:{ 
		type: String,
		required: true,
		unique: true
	},
	password:{ 
		type: String,
		required: true,
	},
	salt:{
		type: String
	},
	invitations:[{
		username: {
			type: String
		},
		eventType: {
			type: String
		}
	}],
	friends:[{
		username: {
			type: String
		} 
	}]
})

userSchema.plugin(uniqueValidator, { message: DUPLICATE_KEY_ERROR_DESC })
const UserModel = dbConnection.model('users', userSchema)

module.exports = UserModel