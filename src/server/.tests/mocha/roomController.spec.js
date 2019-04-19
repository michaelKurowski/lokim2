const roomController = require('../../controllers/room')
const assert = require('chai').assert
const sinon = require('sinon')

const EXPECTED_VALID_RESULT = false // No error
const EXPECTED_INVALID_RESULT = true

const EMPTY_VAR = ''
const VALID_ID = '1234'
const VALID_NAME = 'Room Name'
const VALID_NEW_NAME = 'New Room Name'
const VALID_CREATION_DATE = Date.now()

function RoomMockTemplate(EXPECTED_RESULT){
    return {
        create: function(_, callback){
            return callback(EXPECTED_RESULT)
        },
        deleteOne: function(_, callback){
            return callback(EXPECTED_RESULT)
        },
        findOneAndUpdate: function(_, _, callback){
            return callback(EXPECTED_RESULT)
        },
        findOne: function(_, callback){
            return callback(EXPECTED_RESULT)
        },
        updateOne: function(_, callback){
            return callback(EXPECTED_RESULT)
        }
    }
}

describe('Room Controller Test Suite', () => {
    describe('Unit Tests', () => {
        let sandbox = {}

        beforeEach(() => {
            sandbox.validRoom = new roomController(RoomMockTemplate(EXPECTED_VALID_RESULT)) // Won't throw errors
            sandbox.invalidRoom = new roomController(RoomMockTemplate(EXPECTED_INVALID_RESULT)) //Will throw errors
        })

        afterEach(() => {
            sandbox = {}
        })
        describe('Room Controller', () => {
            it('Should throw an error when no ID is provided', () => {
                const EXPECTED_ERROR_MESSAGE = 'Room must have an ID'
                assert.throws(sandbox.invalidRoom.createRoom, Error, EXPECTED_ERROR_MESSAGE)
            })
            it('Should not throw an error when an ID is provided', () => { 
                assert.doesNotThrow(() => sandbox.validRoom.createRoom(VALID_ID))
            })
            it('Should throw an error if no id, name, or creationDate are provided', () => {
                const EXPECTED_ERROR_MESSAGE = 'Deleting requires a Room ID, Name and Creation Date'
                assert.throws(sandbox.invalidRoom.deleteRoom, Error, EXPECTED_ERROR_MESSAGE)
            })
            it('Should not throw an error providing correct details.', () => {
                assert.doesNotThrow(() => sandbox.validRoom.createRoom(VALID_ID, VALID_NAME, VALID_CREATION_DATE))
            })
            it('Should throw an error if parameters are empty.', () => {
                const EXPECTED_ERROR_MESSAGE = 'ID and new name must be provided when editing room name.'
                assert.throws(sandbox.invalidRoom.editRoomName, Error, EXPECTED_ERROR_MESSAGE)
            })
            it('Should throw an error if names are the same.', () => {
                const EXPECTED_ERROR_MESSAGE = 'Provided room names cannot be the same.'
                assert.throws(() => sandbox.validRoom.editRoomName(VALID_ID, VALID_NAME, VALID_NAME), Error, EXPECTED_ERROR_MESSAGE)
            })
            it('Should not throw an error when providing correct details for editRoomName', () => {
                assert.doesNotThrow(() => sandbox.validRoom.editRoomName(VALID_ID, VALID_NAME, VALID_NEW_NAME))
            })
        })
    })
})