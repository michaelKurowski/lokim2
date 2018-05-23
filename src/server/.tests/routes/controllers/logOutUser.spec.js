const logOutUser = require('../../../routes/controllers/logOutUser')
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const assert = require('chai').assert
const EventEmitter = require('events').EventEmitter
let suite = {}

describe('logOutUser', () => {
	beforeEach(() => {
		suite = {}
		suite.logOutUserMock = logOutUser()
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})

	it('should respond with unauthorized, when user has no session', () => {
		//given
		const requestMock = sinon.stub()

		//when
		suite.logOutUserMock(requestMock, suite.responseMock)

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
		beforeEach(() => {
			
		})

		it('should respond logout user success, when Websocket disconnection was successfully finished ', () => {
			//given
			const destroySessionFailure = false
			const requestMock = createRequestMock(destroySessionFailure)

			//when
			suite.logOutUserMock(requestMock, suite.responseMock)

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
		
		it('should respond bad request, when was error during session destroying', () => {
			//given
			const destroySessionFailure = true
			const requestMock = createRequestMock(destroySessionFailure)
	
			//when
			suite.logOutUserMock(requestMock, suite.responseMock)
	
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
			destroy: (callbackMock) => callbackMock(destroySessionFailure)
		},
		user: {
			username: 'Rick'
		}
	}
}