const roomController = require('../../controllers/room')
const assert = require('chai').assert
const sinon = require('sinon')


const EXPECTED_VALID_RESULT = true

const validRoomMock = {
    create: function(){
        return EXPECTED_VALID_RESULT
    },
    deleteOne: function(){
        return EXPECTED_VALID_RESULT
    },
    findOneAndUpdate(){
        return EXPECTED_VALID_RESULT
    },
    findOne(){
        return callback(true)
    }
}

describe('Room Controller Test Suite', () => {
    describe('Unit Tests', () => {
        let sandbox

        beforeEach(() => {
            sandbox.validRoom = new roomController()
            sandbox.invalidRoom = new roomController()
        })
    })
})