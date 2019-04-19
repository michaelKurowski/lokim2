const _ = require('lodash')
const logger = require('../logger')

class Room {
    constructor(RoomModel = require('../models/room')){
        this.RoomModel = RoomModel
    }

    createRoom(id, name){
        if(_.isEmpty(id)) throw new Error('Room must have an ID')

        return this.RoomModel.create({ id, name }, (err) => handleError(err))
    }

    deleteRoom(id, name, creationDate){
        if(_.isEmpty(id, name, creationDate)) throw new Error('Deleting requires a Room ID, Name and Creation Date')

        return this.RoomModel.deleteOne({
            id,
            name,
            creationDate
        }, (err) => handleError(err))
    }

    editRoomName(id, name, newName){
        if(_.isEmpty(id, name, newName)) throw new Error('ID and new name must be provided when editing room name.')
        if(name === newName) throw new Error('Provided room names cannot be the same.')

        return this.RoomModel.findOneAndUpdate({id, name}, {name: newName}, (err) => {
            if(err) return handleError(err)
        })
    }

    addMessage(id, message, author, date = Date.now()){
        const newMessage = {
            author,
            body: message,
            date
        }

       return this.RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) throw new Error('Could not find room ID.')

            const messages = foundRoom.messages
            messages.push(newMessage)

            return this.RoomModel.updateOne({id}, {messages}, (err, res) => {
                if(err) return handleError(err)

                //Add some logic to make sure res.modifiedCount === 1
            })
        })
    }

    addUser(id, user){
        const newUser = {
            userId: user.id,
            name: user.username,
            joinDate: Date.now()
        }

        this.RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) return handleError(err)

            const users = foundRoom.users
            users.push(newUser)

            this.RoomModel.updateOne({id}, {users}, (err, res) => {
                if(err) return handleError(err)

                //Add some logic to make sure res.modifiedCount === 1
            })
        })
    }

    removeUser(id, user){
        const newUser = {
            userId: user.id,
            name: user.username,
            joinDate: Date.now()
        }

        this.RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) return handleError(err)

            const users = foundRoom.users
            const index = users.findIndex(element => element.userId === newUser.userID)

            users.splice(index, 1)
            
            this.RoomModel.updateOne({id}, {users}, (err, res) => {
                if(err) return handleError(err)

                //Add some logic to make sure res.modifiedCount === 1
            })
        })
    }

    listUsers(id){
        return this.RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) return handleError(err)

            const users = foundRoom.users.map(x => x.name)
            return users
        })
    }

    allMessages(id){
        return this.RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) throw new Error('Could not find room ID.')

            const messages = foundRoom.messages
            return messages
        })
    }
}

module.exports =  Room

function handleError(err){ //TODO: Improve this
    if(err) return logger.warn(err)
}

/**
 * Create Room ✓
 * Delete Room  ✓
 * Edit Room Name ✓
 * Add message ✓
 * Delete message ✓
 * Add user ✓
 * Delete user ✓
 * 
 */