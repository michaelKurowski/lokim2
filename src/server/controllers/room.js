const _ = require('lodash')
const logger = require('../logger')

class Room {
    constructor(RoomModel = require('../models/room')){
        this.RoomModel = RoomModel
    }

    createRoom(id, name){
        if(_.isEmpty(id)) throw new Error('Room must have an ID')

        return RoomModel.create({ id, name }, (err) => handleError(err))
    }

    deleteRoom(id, name, creationDate){
        if(_.isEmpty([id, name, creationDate])) throw new Error('deleteRoom parameter requirements not met.')

        return RoomModel.deleteOne({
            id,
            name,
            creationDate
        }, (err) => handleError(err))
    }

    editRoomName(id, name, newName){
        if(_.isEmpty([id, name, newName])) throw new Error('ID and new name must be provided when editing room name.')

        return RoomModel.findOneAndUpdate({id, name}, {name: newName}, (err) => {
            if(err) return handleError(err)
        })
    }

    addMessage(id, message, author, date = Date.now()){
        const newMessage = {
            author,
            body: message,
            date
        }

       return  RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) throw new Error('Could not find room ID.')

            const messages = foundRoom.messages
            messages.push(newMessage)

            return RoomModel.updateOne({id}, {messages}, (err, res) => {
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

        RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) return handleError(err)

            const users = foundRoom.users
            users.push(newUser)

            RoomModel.updateOne({id}, {users}, (err, res) => {
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

        RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) return handleError(err)

            const users = foundRoom.users
            const index = users.findIndex(element => element.userId === newUser.userID)

            users.splice(index, 1)
            
            RoomModel.updateOne({id}, {users}, (err, res) => {
                if(err) return handleError(err)

                //Add some logic to make sure res.modifiedCount === 1
            })
        })
    }

    listUsers(id){
        return RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) return handleError(err)

            const users = foundRoom.users.map(x => x.name)
            return users
        })
    }

    allMessages(id){
        return RoomModel.findOne({id}, (err, foundRoom) => {
            if(err) throw new Error('Could not find room ID.')

            const messages = foundRoom.messages
            return messages
        })
    }
}

module.export = Room

function handleError(err){
    logger.warn(err)
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