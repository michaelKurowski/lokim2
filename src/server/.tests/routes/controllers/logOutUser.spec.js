const logOutUser = require('../../../routes/controllers/logOutUser')()
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const assert = require('chai').assert
const EventEmitter = require('events').EventEmitter
let suite = {}

describe('logOutUser', () => {
	beforeEach(() => {
		suite = {}
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})

	it('should respond with unauthorized, when user has no session', () => {
		//given
		const requestMock = sinon.stub()

		//when
		logOutUser(requestMock, suite.responseMock)

		//then
		const responseBody = suite.responseMock._getData()
		const responseStatusCode = suite.responseMock._getStatusCode()

		const expectedBody = JSON.stringify({
			description: 'UNAUTHORIZED'
		})
		const expectedStatusCode = 401

		assert.strictEqual(responseBody, expectedBody)
		assert.strictEqual(responseStatusCode, expectedStatusCode)
	})

	describe('#logout when user has open session', () => {
		it('should respond logout user success, when Websocket disconnection was successfully finished ', () => {
			//given
			const DID_LOGGING_OUT_FAILED = false
			const requestMock = createRequestMock(DID_LOGGING_OUT_FAILED)

			//when
			logOutUser(requestMock, suite.responseMock)

			//then
			const responseBody = suite.responseMock._getData()
			const responseStatusCode = suite.responseMock._getStatusCode()

			const expectedStatusCode = 200
			const expectedBody = JSON.stringify({ 
				description: 'OK'
			})

			assert.strictEqual(responseBody, expectedBody)
			assert.strictEqual(responseStatusCode, expectedStatusCode)
		})
		
		it('should respond bad request, when there was error during session destroying', () => {
			//given
			const DID_LOGGING_OUT_FAILED = true
			const requestMock = createRequestMock(DID_LOGGING_OUT_FAILED)
	
			//when
			logOutUser(requestMock, suite.responseMock)
	
			//then
			const responseBody = suite.responseMock._getData()
			const responseStatusCode = suite.responseMock._getStatusCode()
	
			const expectedStatusCode = 400
			const expectedBody = JSON.stringify({ 
				description: 'BAD_REQUEST'
			})
	
			assert.strictEqual(responseBody, expectedBody)
			assert.strictEqual(responseStatusCode, expectedStatusCode)
		})
	})
})

	
function createRequestMock(destroySessionFailure) {
	return {
		session: {
			destroy: (onSessionDestroy) => onSessionDestroy(destroySessionFailure)
		},
		user: {
			username: 'Rick'
		}
	}
}