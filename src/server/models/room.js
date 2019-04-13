const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    messages: [{author: String, body: String, date: Date}],
    creationDate: {type: Date, default: Date.now}
    /**
     * At this stage it makes sense to move the list of users in the room to the database for accessibility.
     * however I will not be commenting this out until a discussion has been held, as this is a major change to existing infrastucture
     * 
     *  */ 
    // users: [{
    //     userId: {type: mongoose.Schema.ObjectId, required: true},
    //     name: String,
    //     joinDate: {type: Date, default: Date.now}
    // }]
})


const RoomModel = dbConnection.model('rooms', roomSchema)

module.exports = RoomModel