const Utilities = require('../utilities')
const assert = require('chai').assert


let suite = null

describe('utilities.js', () => {
	afterEach(() => {
		suite = null
	})

	describe('#createSaltedHash()', () => {
		beforeEach(() => {
			suite = {}
			suite.DUMMY_PASSWORD = 'imADummyPassword321'
			suite.DUMMY_SALT = 'imADummySalt321'
		})

		it('should return null when no arguments are password', () => {
			//given
			
			//when
			const generatedHash = Utilities.createSaltedHash()

			//then
			assert.isNull(generatedHash)
		})

		it('should return null when no password is passed', () => {
			//given

			const salt = suite.DUMMY_SALT
			
			//when
			const generatedHash = Utilities.createSaltedHash(salt)

			//then
			assert.isNull(generatedHash)
		})

		it('should return string when correct password and salt are passed', () => {
			//given

			const salt = suite.DUMMY_SALT
			const password = suite.DUMMY_PASSWORD
			
			//when
			const generatedHash = Utilities.createSaltedHash(salt, password)

			//then
			assert.isString(generatedHash)
		})
	})

	describe('#generateSalt()', () => {
		beforeEach(() => {
			suite = {}
			suite.DUMMY_SALT_SIZE = 60
		})

		it('should return null when no salt size is given', () => {
			//given

			//when
			const generatedSalt = Utilities.generateSalt()

			//then
			assert.isNull(generatedSalt)
		})

		it('should return string', () => {
			//given
			const saltSize = suite.DUMMY_SALT_SIZE

			//when
			const generatedSalt = Utilities.generateSalt(saltSize)

			//then
			assert.isString(generatedSalt)
		})

		it('should return different value every time', () => {
			//given
			const saltSize = suite.DUMMY_SALT_SIZE

			//when
			const generatedSalt1 = Utilities.generateSalt(saltSize)
			const generatedSalt2 = Utilities.generateSalt(saltSize)
			//then
			assert.notStrictEqual(generatedSalt1, generatedSalt2)
		})
	})

	describe('#createError()', () => {
		beforeEach(() => {
			suite = {}
			suite.DUMMY_MESSAGE = 'Im a happy error'
		})

		it('should return an object with all required properties', () => {
			//given
			const message = suite.DUMMY_MESSAGE

			//when
			const createdError = Utilities.createError(message)

			//then
			assert.exists(createdError.description)
		})
	})
})