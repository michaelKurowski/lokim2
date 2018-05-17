const isUserAuthenticated = require('../../../../routes/controllers/Middleware/isUserAuthenticated')
const assert = require('chai').assert
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const EventEmitter = require('events').EventEmitter

let suite = {}

describe('isUserAuthenticated', () => {
	beforeEach(() => {
		suite = {}
		suite.isUserAuthenticatedMock = isUserAuthenticated(suite.passportMock)
		suite.nextSpy = sinon.spy()
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})
	it('should skip to next middleware by calling next() when user is already logged in ', () => {
		//given
		const requestMock = {
			isAuthenticated: () => true
		}

		//when
		suite.isUserAuthenticatedMock(requestMock, suite.responseMock, suite.nextSpy)

		//then
		assert.isTrue(suite.nextSpy.calledOnce)
	})

	it('should respond with user unathorized description and 401 status code ', () => {
		//given
		const requestMock = {
			isAuthenticated: () => false
		}
			
		//when
		suite.isUserAuthenticatedMock(requestMock, suite.responseMock, suite.nextSpy)
	
		//then
		const expectedBody = JSON.stringify({
			description: 'UNAUTHORIZED'
		})
		const expectedStatusCode = 401

		const responseBody = suite.responseMock._getData()
		const responseStatusCode = suite.responseMock._getStatusCode()

		assert.strictEqual(responseBody, expectedBody)
		assert.strictEqual(responseStatusCode, expectedStatusCode)
	})

})