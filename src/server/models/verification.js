const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema

const DUPLICATE_KEY_ERROR_DESC = 'There was a duplicate key'

const emailSchema = new Schema({
	username:{
		type: String,
		require: true,
		unique: true
	},
	token: {
		type: String,
		required: true,
		unique: true
	}
})

emailSchema.plugin(uniqueValidator, {message: DUPLICATE_KEY_ERROR_DESC})
const VerifyModel = dbConnection.model('verify', emailSchema)

module.exports = VerifyModel
