const dbConnection = require('../dbConnection')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema

const requiredParamDesc = 'This param is required'
const duplicateKeyErrorDesc = 'There was a duplicate key'


const userSchema = new Schema({
	username:{ 
		type: String,
		required: requiredParamDesc,
		unique: true
	},
	email:{ 
		type: String,
		required: requiredParamDesc,
		unique: true
	},
	password:{ 
		type: String,
		required: requiredParamDesc,
	}, 
	salt:{
		type: String
	}
})

/*
userSchema.post('save', (error, doc, next) => {
	if (error.name === 'BulkWriteError' && error.code === 11000) {
		next(new Error(duplicateKeyErrorDesc))
	} else {
		next(error)
	}
})
*/

userSchema.plugin(uniqueValidator, { message: duplicateKeyErrorDesc })
const UserModel = dbConnection.model('users', userSchema)

module.exports = UserModel