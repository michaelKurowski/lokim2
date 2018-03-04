const dbConnection = require('../dbConnection')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    username:{ 
        type: String,
        required: true,
        unique: true},
    email:{ 
        type: String,
        required: true,
        unique: true},
    password:{ 
        type: String,
        required: true},
})

const UserModel = dbConnection.model('users',userSchema)

function saveUserToDB(userData) {
    return UserModel.init()
        .then(()=> UserModel.create(userData,(err) => {
                console.log('User has been created')
            })
        )
} 

module.exports = saveUserToDB