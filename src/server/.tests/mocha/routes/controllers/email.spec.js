const emailController = require('../../../../routes/controllers/email')
const assert = require('chai').assert
const sinon = require('sinon')

let suite = {}
const DUMMY_EMAIL = 'dummy@mail.com'
const DUMMY_SUBJECT = 'subject'
const DUMMY_BODY = 'bodybodybody'
const NO_EMAIL = null
const EXPECTED_ERROR_MESSAGE = 'Receive address, subject or body cannot be undefined.'
const BUFFER_ALLOC_SIZE = 20
const BUFFER_VALUE = 2
const HEX = 'hex'

describe('email controller', () => {
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
            sinon.stub(crypto, 'randomBytes').returns(buf1)

            const generatedToken = emailController.createToken()
            const EXPECTED_TOKEN = buf1.toString(HEX)
            const EXPECTED_LENGTH = 20

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
      it('Should throw an error when no options are provided.', () => {
          assert.throws(emailController.sendMail(NO_EMAIL), EXPECTED_ERROR_MESSAGE)
      })
    })
})