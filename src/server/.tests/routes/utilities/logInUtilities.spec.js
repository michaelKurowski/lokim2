const assert = require('chai').assert
const sinon = require('sinon')
const EventEmitter = require('events').EventEmitter
const httpMocks = require('node-mocks-http')
const logInUtilities = require('../../../routes/controllers/utilities/logInUtilities')

let suite = {}
describe('#logInUtilities', () => {
	beforeEach(() => {
		suite = {}
		suite.requestMock = createRequestMock()
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})
	describe('#isSuccessfullLoggedIn', () => {
		beforeEach(() => {
			suite.isSuccessfullyLoggedIn = logInUtilities(suite.requestMock, suite.responseMock, suite.nextSpy).isSuccessfullyLoggedIn
		})

		it('should respond with sucessful user login when no error was given', () => {
			//given
			const error = null

			//when
			suite.isSuccessfullyLoggedIn(error)

			//then
			const responseStatusCode = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedBody = JSON.stringify({
				description: 'OK'
			})
			const expectedStatusCode = 200

			assert.strictEqual(responseBody, expectedBody)
			assert.strictEqual(responseStatusCode, expectedStatusCode)
		})

		it('should respond with error status code and description when error was given', () => {
			//given
			const error = {
				code: 401,
				description: 'UNAUTHORIZED'
			}

			//when
			suite.isSuccessfullyLoggedIn(error)

			//then
			const statusCode = suite.responseMock._getStatusCode()
			const payload = suite.responseMock._getData()
			const expectedStatusCode = error.code
			const expectedPayload = JSON.stringify({
				description: error.description
			})

			assert.strictEqual(statusCode, expectedStatusCode)
			assert.strictEqual(payload, expectedPayload)
		})
	})

	describe('#proceedLogIn', () => {
		beforeEach(() => {
			suite.proceedLogIn = logInUtilities(suite.requestMock, suite.responseMock, suite.nextSpy).proceedLogIn
		})
		it('should respond with error status code and description, when error is given', () => {
			//given
			const error = {
				code: 401,
				description: 'UNAUTHORIZED'
			}
			const userInstance = {}
			const info = null

			//when
			suite.proceedLogIn(error, userInstance, info)

			//then
			const statusCode = suite.responseMock._getStatusCode()
			const payload = suite.responseMock._getData()
			const expectedStatusCode = error.code
			const expectedPayload = JSON.stringify({
				description: error.description
			})

			assert.strictEqual(statusCode, expectedStatusCode)
			assert.strictEqual(payload, expectedPayload)

		})

		it('should respond with BAD REQUEST, when userInstance is null', () => {
			//given
			const error = null
			const userInstance = null
			const info = null

			//when
			suite.proceedLogIn(error, userInstance, info)

			//then
			const statusCode = suite.responseMock._getStatusCode()
			const payload = suite.responseMock._getData()

			const expectedStatusCode = 400
			const expectedPayload = JSON.stringify({
				description: 'BAD_REQUEST'
			})

			assert.strictEqual(statusCode, expectedStatusCode)
			assert.strictEqual(payload, expectedPayload)

		})

		it('should call req.logIn, when was passed correct userInstance without any error', () => {
			//given
			const error = null
			const userInstance = {
				username: 'Rick',
				password: 'TheSmartestPersonInMultiUniverse'
			}
			const info = null

			//when
			suite.proceedLogIn(error, userInstance, info)

			//then
			const logInSpy = suite.requestMock.logIn
			assert.isTrue(logInSpy.calledOnce)
		})
	})
})

function createRequestMock() {
	return {
		logIn: sinon.spy()
	}
}