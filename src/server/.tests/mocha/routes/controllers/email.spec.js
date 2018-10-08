const emailController = require('../../../../routes/controllers/email')
const assert = require('chai').assert
const sinon = require('sinon')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const DUMMY_EMAIL = 'dummy@mail.com'
const DUMMY_SUBJECT = 'subject'
const DUMMY_BODY = 'bodybodybody'
const DUMMY_USER = 'dummyUser'
const DUMMY_PASSWORD = 'dummyPassword'
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
const BUFFER_VALUE = 2
const HEX = 'hex'

const RES_MOCK = {
    _code: "",
    json: (obj) => {
        return {
            CODE: _code,
            DESCRIPTION: obj.DESCRIPTION
        }
    },
    status: function(code){
        _code = code
        return this
    }
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
        it('Should create a valid token of length 20', () => {
            const buf1 = Buffer.alloc(BUFFER_ALLOC_SIZE, BUFFER_VALUE)
            sandbox.stub(crypto, 'randomBytes').returns(buf1)

            const generatedToken = emailController.createToken()
            const EXPECTED_TOKEN = buf1.toString(HEX)
            const EXPECTED_LENGTH = 40

            assert.strictEqual(generatedToken, EXPECTED_TOKEN)
            assert.strictEqual(generatedToken.length, EXPECTED_LENGTH)
        })
        it('Should return a different value every time', () => {
            const generatedToken1 = emailController.createToken()
            const generatedToken2 = emailController.createToken()
            assert.notStrictEqual(generatedToken1, generatedToken2)
        })
    })
    describe('Mail Options', () => {
      it('Should be equal.', () => {
        const generatedOptions = emailController.mailOptions(DUMMY_EMAIL, DUMMY_SUBJECT, DUMMY_BODY)
        const EXPECTED_OPTIONS = {
            from: '"Lokim Messenger Services" <lokim.messenger@mail.com>',
            to: 'dummy@mail.com',
            subject: 'subject',
            text: 'bodybodybody'
        }
        assert.deepStrictEqual(generatedOptions, EXPECTED_OPTIONS)
      })
    })
    describe('Sending Mail', () => {
        let sandbox 
        const DUMMY_TRANSPORT = {
            sendMail: sinon.spy()
        }
        beforeEach(() => {
            sandbox = sinon.sandbox.create()        
        })
        afterEach(() => {
            sandbox.restore()
        })
        //TODO: Maybe refactor, not happy with this.
        it('Should send an e-mail with the specified details.', () => {
            sandbox.stub(nodemailer, 'createTransport').returns(DUMMY_TRANSPORT)
            const transport = nodemailer.createTransport()
            emailController.sendMail(transport)(DUMMY_OPTIONS, (err) => {
                assert.strictEqual(err, null)
            })
        })
        it('Should throw an error when no options are provided.', () => {
            assert.throws(() => emailController.sendMail(DUMMY_TRANSPORT)(NO_EMAIL), Error, EXPECTED_ERROR_MESSAGE)
        })
    })
    describe('Save Record to DB', () => {
        let suite = {}
        const verifyMock = function(){
            return {
                save: sinon.stub().returns(new Promise(res => res()))
            }
        }
        beforeEach(() => {
            suite.saveRecord = emailController.saveRecordToDB(verifyMock)
        })
        afterEach(() => {
            suite = {}
        })
        it('Should return true if all inputs are valid.', () => {
            const ACTUAL_RESULT = suite.saveRecord(DUMMY_USER, DUMMY_TOKEN)
            const EXPECTED_RESULT = true

            assert(ACTUAL_RESULT, EXPECTED_RESULT)
        })
        it('Should throw an error when no details are provided.', () => {
            assert.throws(() => suite.saveRecord(INVALID_USER, INVALID_TOKEN))
        })
    })
    describe('Send Verification Mail', () => {
        let suite = {}
        const DUMMY_TRANSPORT = {
            sendMail: sinon.spy()
        }
        
        beforeEach(() => {
            suite.send = emailController.sendVerificationMail(DUMMY_TRANSPORT)
        })
        afterEach(() => {
            suite = {}
        })
        it('Should throw an error when invalid details are provided', () => {
            assert.throws(() => suite.send(DUMMY_EMAIL, DUMMY_HOST, INVALID_TOKEN))
        })
        it('Should send an email when details are correct', () => {
            suite.send(DUMMY_EMAIL, DUMMY_HOST, DUMMY_TOKEN)
            sinon.assert.calledOnce(DUMMY_TRANSPORT.sendMail)
        })
    })
    describe('Email Verification', () => {
        let suite = {}

        beforeEach(() => {
            const verifyMock = {
                find: function(token, callback){
                    return callback(null, {username: DUMMY_USER})
                },
                remove: function(token, callback){
                    return callback(null)
                }
            }

            const userMock = {
                findOneAndUpdate: function(username, action, callback){
                    return callback(null)
                }
            }
            suite.verify = emailController.verifyUser(verifyMock, userMock)
        })
        afterEach(() => {
            suite = {}
        })

        it('Should return a BAD_REQUEST message if no token is provided.', () => {
            const NO_TOKEN = {params: {token: null}}

            const EXPECTED_RESULT = {
                CODE: 400, 
                DESCRIPTION: 'BAD_REQUEST'
            }
            const ACTUAL_RESULT = suite.verify(NO_TOKEN, RES_MOCK)
            assert.deepStrictEqual(ACTUAL_RESULT, EXPECTED_RESULT)
        })
        it('Should find a user based on the token.', () => {
            const TOKEN = {params: {token: DUMMY_TOKEN}}

            const EXPECTED_RESULT = {
                CODE: 200,
                DESCRIPTION: 'OK'
            }

            const ACTUAL_RESULT = suite.verify(TOKEN, RES_MOCK)
            assert.deepStrictEqual(ACTUAL_RESULT, EXPECTED_RESULT)
        })
    })
})