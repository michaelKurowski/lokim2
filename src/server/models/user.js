const dbConnection = require('../dbConnectionProvider').getDbConnection()
const _ = require('lodash')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const NotificationModel = require('./notification')
const FriendModel = require('./friend')
const Schema = mongoose.Schema

const MESSAGES = {
	DUPLICATE_KEY_ERROR: 'There was a duplicate key',
	DUPLICATE_FRIEND : 'You are friends already'
}

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
	notifications:[NotificationModel.schema],
	friends:{
		type: [FriendModel.schema],
		validate: {
			validator: val => {
				const usernamesList = _.map(val, user => user.username)
				return _.uniq(usernamesList).length === usernamesList.length
			},
			message: MESSAGES.DUPLICATE_FRIEND
		
		}
	}
})

userSchema.plugin(uniqueValidator, { message: MESSAGES.DUPLICATE_KEY_ERROR })
const UserModel = dbConnection.model('users', userSchema)

module.exports = UserModel