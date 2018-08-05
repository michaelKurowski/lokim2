const assert = require('chai').assert
const sinon = require('sinon')
const EventEmitter = require('events').EventEmitter
const httpMocks = require('node-mocks-http')
const initializeLoginHandler = require('../../../../routes/controllers/utilities/initializeLoginHandler')

let suite = {}
describe('#initializeLoginHandler', () => {
	beforeEach(() => {
		suite = {}
		suite.requestMock = createRequestMock()
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
		suite.loginHandler = initializeLoginHandler(suite.requestMock, suite.responseMock)
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
		suite.loginHandler(error, userInstance, info)

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
		suite.loginHandler(error, userInstance, info)

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
		suite.loginHandler(error, userInstance, info)

		//then
		const logInSpy = suite.requestMock.logIn
		assert.isTrue(logInSpy.calledOnce)
	})
})

function createRequestMock() {
	return {
		logIn: sinon.spy()
	}
}