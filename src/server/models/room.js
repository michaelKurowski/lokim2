const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    messages: [{author: String, body: String, date: Date}],
    creationDate: {type: Date, default: Date.now},
    users: [{
        userId: {type: mongoose.Schema.ObjectId, required: true},
        name: String,
        joinDate: {type: Date, default: Date.now}
    }]
})


const RoomModel = dbConnection.model('rooms', roomSchema)

module.exports = RoomModel