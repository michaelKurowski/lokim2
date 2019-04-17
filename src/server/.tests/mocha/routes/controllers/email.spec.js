const emailController = require('../../../../routes/controllers/email')
const assert = require('chai').assert
const sinon = require('sinon')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const config = require('../../../../config.json')
const DUMMY_EMAIL = config.email.email
const DUMMY_SUBJECT = 'subject'
const DUMMY_BODY = 'bodybodybody'
const DUMMY_USER = 'dummyUser'
const DUMMY_PASSWORD = 'dummyPassword'
const LOKIM_EMAIL = `"Lokim Messenger Services" <${config.email.email}>`
const DUMMY_HOST = 'localhost'
const DUMMY_TOKEN = '1234567890!#'
const NO_EMAIL = [null, null, null]
const EXPECTED_ERROR_MESSAGE = 'Mail options cannot be undefined.'
const BUFFER_ALLOC_SIZE = 20
const INVALID_TOKEN = null
const INVALID_USER = null
const DUMMY_OPTIONS = {
    to: DUMMY_EMAIL,
    subject: DUMMY_SUBJECT,
    text: DUMMY_BODY
}
const BUFFER_VALUE = 'H'
const TOKEN_FORMAT = 'hex'

const RESPONSE_MOCK = {
    status: () => ({
        json() {}
    }),
    redirect() {}
}

describe('E-mail Controller', () => {
    describe('Sandboxed Token Creation', () => {
        let sandbox

        beforeEach(() => {
            sandbox = sinon.sandbox.create()
        })

        afterEach(() => {
            sandbox.restore()
        })
        it('Should create a valid token of length 40', () => {
            const mockBuffer = Buffer.alloc(BUFFER_ALLOC_SIZE, BUFFER_VALUE)

            sandbox.stub(crypto, 'randomBytes').returns(mockBuffer)
            
            const EXPECTED_TOKEN = '4848484848484848484848484848484848484848'
            const EXPECTED_LENGTH = 40

            const ACTUAL_TOKEN = emailController.createToken()
            const ACTUAL_LENGTH = ACTUAL_TOKEN.length
            
            assert.strictEqual(ACTUAL_TOKEN, EXPECTED_TOKEN)
            assert.strictEqual(ACTUAL_LENGTH, EXPECTED_LENGTH)
        })
        it('Should return a different value every time', () => {
            const generatedToken1 = emailController.createToken()
            const generatedToken2 = emailController.createToken()
            assert.notStrictEqual(generatedToken1, generatedToken2)
        })
    })
    describe('Mail Options', () => {
      it('Should return an object equal to the expected output.', () => {
        const generatedOptions = emailController.mailOptions(DUMMY_EMAIL, DUMMY_SUBJECT, DUMMY_BODY)
        const EXPECTED_OPTIONS = {
            from: LOKIM_EMAIL,
            to: DUMMY_EMAIL,
            subject: DUMMY_SUBJECT,
            text: DUMMY_BODY
        }
        assert.deepStrictEqual(generatedOptions, EXPECTED_OPTIONS)
      })
    })
    describe('Sending Mail', () => {
        let sandbox 
        beforeEach(() => {
            sandbox = sinon.sandbox.create()
            sandbox.DUMMY_TRANSPORT = {
                sendMail: sinon.spy()
            }   
        })
        afterEach(() => {
            sandbox.restore()
        })

        it('Should attempt to send an e-mail by calling sendMail of the transporter.', () => {
            const sendMail = emailController.sendMail(sandbox.DUMMY_TRANSPORT)
            sendMail(DUMMY_OPTIONS)
            sinon.assert.calledOnce(sandbox.DUMMY_TRANSPORT.sendMail)
        })
        it('Should throw an error when no options are provided.', () => {
            assert.throws(() => emailController.sendMail(sandbox.DUMMY_TRANSPORT)(NO_EMAIL), Error, EXPECTED_ERROR_MESSAGE)
        })
    })
    describe('Save Record to DB', () => {
        let suite = {}
        const verifyMock = function(){
            return {
                save: sinon.stub().resolves()
            }
        }
        beforeEach(() => {
            suite.saveRecord = emailController.saveRecordToDB(verifyMock)
        })
        afterEach(() => {
            suite = {}
        })
        it('Should return true if all inputs are valid.', () => {
            const ARE_ALL_RESULTS_VALID = suite.saveRecord(DUMMY_USER, DUMMY_TOKEN)
            const ALL_RESULTS_ARE_VALID = true

            assert(ARE_ALL_RESULTS_VALID, ALL_RESULTS_ARE_VALID)
        })
        it('Should throw an error when no details are provided.', () => {
            const EXPECTED_ERROR_MESSAGE = 'You must provide a username and verification token.'
            assert.throws(() => suite.saveRecord(INVALID_USER, INVALID_TOKEN), Error, EXPECTED_ERROR_MESSAGE)
        })
    })
    describe('Send Verification Mail', () => {
        let suite = {}

        beforeEach(() => {
            suite.DUMMY_TRANSPORT = {
                sendMail: sinon.spy()
            }
            suite.send = emailController.sendVerificationMail(suite.DUMMY_TRANSPORT)
        })
        afterEach(() => {
            suite = {}
        })
        it('Should throw an error when invalid details are provided', () => {
            const EXPECTED_ERROR_MESSAGE = 'You must provide a hostname, email and verification token.'
            assert.throws(() => suite.send(DUMMY_EMAIL, DUMMY_HOST, INVALID_TOKEN), Error, EXPECTED_ERROR_MESSAGE)
        })
        it('Should send an email when details are correct', () => {
            suite.send(DUMMY_EMAIL, DUMMY_HOST, DUMMY_TOKEN)
            sinon.assert.calledOnce(suite.DUMMY_TRANSPORT.sendMail)
        })
    })
    describe('Email Verification', () => {
        let suite = {}

        beforeEach(() => {
            const verifyMock = {
                findOne: function(token, callback){

                    return callback(null, {username: DUMMY_USER})    
                },
                remove: function(token){
                    return null
                }
            }
            const verifyMockToFail = {
                findOne: function(token, callback){
                    return callback(true, null)    
                }
            }

            const userMock = {
                findOneAndUpdate: function(username, action, callback){
                    return callback(null)
                }
            }
            const userMockToFail = {
                findOneAndUpdate: function(username, action, callback){
                    return callback(true)
                }
            }
            suite.verify = emailController.verifyUser(verifyMock, userMock)
            suite.verifyUserNotFound = emailController.verifyUser(verifyMock, userMockToFail)
            suite.verifyTokenNotFound = emailController.verifyUser(verifyMockToFail, userMock)
        })
        afterEach(() => {
            suite = {}
        })

        it('Should return an INVALID_TOKEN Error if no token is provided.', () => {
            const NO_TOKEN = {params: {token: null}}

            const EXPECTED_ERROR_MESSAGE = 'Invalid token.'
            
            assert.strictEqual(suite.verify(NO_TOKEN, RESPONSE_MOCK), EXPECTED_ERROR_MESSAGE)
        })
        it('Should find a user based on the token.', () => {
            const TOKEN = {params: {token: DUMMY_TOKEN}}
            const NO_VALIDATION_ERROR = null

            const RESULTING_VALIDATION_ERROR = suite.verify(TOKEN, RESPONSE_MOCK)
            assert.strictEqual(RESULTING_VALIDATION_ERROR, NO_VALIDATION_ERROR)
        })
        it('Should return an INVALID_TOKEN if no token is found', () => {
            const requestMock = {params: {token: 'invalid token'}}
            const EXPECTED_ERROR_MESSAGE = 'Invalid token.'
            assert.strictEqual(suite.verifyTokenNotFound(requestMock, RESPONSE_MOCK), EXPECTED_ERROR_MESSAGE)
        })
        it('Should return an error if no user is found, but a token is', () => {
            const requestMock = {params: {token: DUMMY_TOKEN}}
            const EXPECTED_ERROR_MESSAGE = 'User not found.'

            assert.strictEqual(suite.verifyUserNotFound(requestMock, RESPONSE_MOCK), EXPECTED_ERROR_MESSAGE)
        })
    })
})