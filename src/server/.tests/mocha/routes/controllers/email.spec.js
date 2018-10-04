const emailController = require('../../../../routes/controllers/email')
const assert = require('chai').assert
const sinon = require('sinon')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

const DUMMY_EMAIL = 'dummy@mail.com'
const DUMMY_SUBJECT = 'subject'
const DUMMY_BODY = 'bodybodybody'
const NO_EMAIL = [null, null, null]
const EXPECTED_ERROR_MESSAGE = 'Mail options cannot be undefined.'
const BUFFER_ALLOC_SIZE = 20
const DUMMY_OPTIONS = {
    to: DUMMY_EMAIL,
    subject: DUMMY_SUBJECT,
    text: DUMMY_BODY
}
const BUFFER_VALUE = 2
const DUMMY_TRANSPORT = {
    sendMail: (data, callback) => {
        callback(null, {
            messageId: 1
        });
    }
}
const HEX = 'hex'

describe('E-mail Controller', () => {
	beforeEach(() => {
        suite = {}
    })

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
    describe('Prepare Verification', () => {
        it('Should accept user data, URL of host domain, and a verification token.', () => {

        })
        it('Should save an instance of the user with the verification token to the verification table.', () => {

        })
        it('Should throw an error if any of the details are undefined.', () => {

        })
    })
    describe('Email Verification', () => {
        it('Should return a BAD_REQUEST message if no token is provided.', () => {

        })
        it('Should find a user based on the token.', () => {

        })
        it('Should return a BAD_REQUEST if no user is found.', () => {

        })
        it('Should return a BAD_REQUEST if there is no user in the user table that matches the username found in the verify table.', () => {

        })
        it('Should find a user and update his active flag to true, delete the token and return OK', () => {

        })
    })
})