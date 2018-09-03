const emailController = require('../../../../routes/controllers/email')
const assert = require('chai').assert
const sinon = require('sinon')

let suite = {}

describe('email controller', () => {
	beforeEach(() => {
        suite = {}
    })

    describe('Token Creation', () => {
        // beforeEach(() => {
        //     suite.DUMMY_USERID = '_A12345'
        //     suite.DUMMY_USERNAME = 'Rick'
        //     suite.DUMMY_PASSWORD = 'ImPickleRick'
        //     suite.DUMMY_EMAIL = 'morty@ricks-confederation.com'
        // })
        it('Should create a valid token based on Math.random and current date', () => {
            sinon.stub(Math, 'random').returns(4)
            sinon.stub(Date).returns(1535984556)
            const generatedToken = emailController.createToken()
            const EXPECTED_TOKEN = null; //ADD LATER #FIXME

            assert.strictEqual(generatedToken, EXPECTED_TOKEN)
        })
        it('Should return a different value every time', () => {
            const generatedToken1 = emailController.createToken()
            const generatedToken2 = emailController.createToken()
            assert.notStrictEqual(generatedToken1, generatedToken2)
        })
    })
})