const dbConnection = require('../dbConnectionProvider').getDbConnection()
const _ = require('lodash')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const pendingNotificationsSchema = require('./pendingNotifications')
const friendsSchema = require('./friends')
const Schema = mongoose.Schema

const DUPLICATE_KEY_ERROR_DESC = 'There was a duplicate key'
const DUPLICATE_FRIEND_DESC = 'You are friends already'

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
	pendingNotifications:[pendingNotificationsSchema],
	friends:{
		type: [friendsSchema],
		validate: {
			validator: val => {
				const usernamesList = _.map(val, user => user.username)
				return _.uniq(usernamesList).length === usernamesList.length
			},
			message: DUPLICATE_FRIEND_DESC
		
		}
	}
})

userSchema.plugin(uniqueValidator, { message: DUPLICATE_KEY_ERROR_DESC })
const UserModel = dbConnection.model('users', userSchema)

module.exports = UserModel