const passportLoginCallbacks = require('../../../../routes/controllers/utilities/passportLoginCallbacks')
const responseMessages = require('../../../../routes/controllers/utilities/responseMessages')
const statusCodes = require('../../../../routes/controllers/utilities/statusCodes')
const EventEmitter = require('events').EventEmitter
const httpMocks = require('node-mocks-http')
const assert = require('chai').assert
let suite = {}

describe('Passport Login Callbacks', () => {
	beforeEach(() => {
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})


	describe('authenticate callback', () => {
		beforeEach(() => {
			suite.authenticateCallback = passportLoginCallbacks.authenticateCallback(null, suite.responseMock)
		})

		it('should respond with BAD REQUEST error when unknown error was given', done => {
			
			//given
			const DUMMY_ERROR = responseMessages.errors.BAD_REQUEST
			const DUMMY_USER = null
			const DUMMY_INFO = null

			//when
			suite.authenticateCallback(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)

			//then
			const responseStatus = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedResponseStatus = statusCodes.BAD_REQUEST
			const expectedResponseBody = JSON.stringify({
				description: responseMessages.errors.BAD_REQUEST
			})

			assert.strictEqual(responseBody, expectedResponseBody)
			assert.equal(responseStatus, expectedResponseStatus)
			done()
		})

		it('should respond with INTERNAL SERVER error when unknown error was given', done => {
			
			//given
			const DUMMY_ERROR = 'Morty is smarter than Rick'
			const DUMMY_USER = null
			const DUMMY_INFO = null

			//when
			suite.authenticateCallback(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)

			//then
			const responseStatus = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedResponseStatus = statusCodes.INTERNAL_SERVER
			const expectedResponseBody = JSON.stringify({
				description: responseMessages.errors.INTERNAL_SERVER
			})

			assert.strictEqual(responseBody, expectedResponseBody)
			assert.equal(responseStatus, expectedResponseStatus)
			done()
		})


		it('should respond with UNAUTHORIZED ACCESS when uncompleted or invalid params was given', done => {
			
			//given
			const DUMMY_ERROR = responseMessages.errors.UNAUTHORIZED
			const DUMMY_USER = null
			const DUMMY_INFO = null

			//when
			suite.authenticateCallback(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)

			//then
			const responseStatus = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedResponseStatus = statusCodes.UNAUTHORIZED
			const expectedResponseBody = JSON.stringify({
				description: responseMessages.errors.UNAUTHORIZED
			})

			assert.strictEqual(responseBody, expectedResponseBody)
			assert.equal(responseStatus, expectedResponseStatus)
			done()
		})

	})


	describe('logIn Callback', () => {
		beforeEach(() => {
			suite.logInCallback = passportLoginCallbacks.logInCallback(suite.responseMock)
		})


		it('should respond with internal server error when error was given', done => {
			
			//given
			const DUMMY_ERROR = 'Morty is smarter than Rick'

			//when
			suite.logInCallback(DUMMY_ERROR)

			//then
			
			const responseStatus = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedResponseStatus = statusCodes.INTERNAL_SERVER
			const expectedResponseBody = JSON.stringify({
				description: responseMessages.errors.INTERNAL_SERVER
			})

			assert.strictEqual(responseBody, expectedResponseBody)
			assert.equal(responseStatus, expectedResponseStatus)
			done()
		
		})


		it('should respond with user successfully login message when valid data was given', done => {

			//given
			const DUMMY_ERROR = null

			//when
			suite.logInCallback(DUMMY_ERROR)

			//then
			
			const responseStatus = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedResponseStatus = statusCodes.OK
			const expectedResponseBody = JSON.stringify({
				description: responseMessages.successes.LOGGED_USER
			})

			assert.strictEqual(responseBody, expectedResponseBody)
			assert.equal(responseStatus, expectedResponseStatus)
			done()
			
			
		})


	})
})