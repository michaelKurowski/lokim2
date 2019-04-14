const _ = require('lodash')
const logger = require('../../logger')

class Room {
    constructor(RoomModel = require('../models/room')){
        this.RoomModel = RoomModel
    }

    createRoom(id, name){
        if(_.isEmpty(id)) throw new Error('Room must have an ID')

        RoomModel.create({ id, name }
        , (err) => handleError(err))
    }

    deleteRoom(id, name, creationDate){
        if(_.isEmpty([id, name, creationDate])) throw new Error('deleteRoom parameter requirements not met.')

        RoomModel.deleteOne({
            id,
            name,
            creationDate
        }, (err) => handleError(err))
    }

    editRoomName(id, name){
        if(_.isEmpty([id, name])) throw new Error('ID and new name must be provided when editing room name.')

        RoomModel.findOne({_id: id, name}, (err, foundRoom) => {

        })
    }

    addMessage(id, message, author, date = Date.now()){
        const newMessage = {
            author,
            body: message,
            date
        }

        RoomModel.findOne({id}, (err, foundRoom) => {
            const messages = foundRoom.messages
            messages.push(newMessage)

            RoomModel.updateOne({id}, {messages}, (err, res) => {
                if(err) handleError(err)

                //Add some logic to make sure res.modifiedCount === 1
            })
        })
    }
}


function handleError(err){
    logger.warn(err)
}

/**
 * Create Room
 * Delete Room
 * Edit Room Name
 * Add message
 * Delete message
 * Add user
 * Delete user
 * 
 */