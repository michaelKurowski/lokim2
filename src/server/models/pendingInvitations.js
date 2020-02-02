const dbConnection = require('../dbConnectionProvider').getDbConnection()
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pendingInvitationsSchema = new Schema({
    from: {
        type:String,
        required:true
    },
    to: {
        type:String,
        required:true
    }
})

const PendingInvitationsModel = dbConnection.model('pendingInvitations', pendingInvitationsSchema)

module.exports = PendingInvitationsModel