const emailController = require('../../../../routes/controllers/email')
const assert = require('chai').assert
const sinon = require('sinon')

let suite = {}
const DUMMY_EMAIL = 'dummy@mail.com'
const DUMMY_SUBJECT = 'subject'
const DUMMY_BODY = 'bodybodybody'
const NO_EMAIL = null
const EXPECTED_ERROR_MESSAGE = 'Receive address, subject or body cannot be undefined.'

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
      it('Should throw an error when no options are provided.', () => {
          assert.throws(emailController.sendMail(NO_EMAIL), EXPECTED_ERROR_MESSAGE)
      })
    })
})