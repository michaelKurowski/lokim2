const loginUtils = require('../../../../routes/controllers/utilities/loginUtils')
const responseMessages = require('../../../../routes/controllers/utilities/responseMessages')
const statusCodes = require('../../../../routes/controllers/utilities/statusCodes')
const EventEmitter = require('events').EventEmitter
const httpMocks = require('node-mocks-http')
const assert = require('chai').assert
const sinon = require('sinon')

let suite = {}

describe('Login Utils', () => {
	suite = {}
	beforeEach(() => {
		suite.requestMock = createRequestMock()
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})


	})

	describe('authentication Utils', () => {
		beforeEach(() => {
			suite.authenticationUtilsMock = loginUtils.authenticationUtils(suite.requestMock, suite.responseMock)
		})

		describe('authenticate callback', () => {
			beforeEach(() => {
				suite.handleAuthenticationMock = suite.authenticationUtilsMock.handleAuthentication
			})
			
			it('should respond with BAD REQUEST message when Bad request error was given', () => {
				//given
				const DUMMY_ERROR = responseMessages.errors.BAD_REQUEST
				const DUMMY_USER = null
				const DUMMY_INFO = null
	
				//when
				suite.handleAuthenticationMock(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)

				//then
				const responseStatus = suite.responseMock._getStatusCode()
				const responseBody = suite.responseMock._getData()
				
				const expectedResponseStatus = statusCodes.BAD_REQUEST
				const expectedResponseBody = JSON.stringify({
					description: responseMessages.errors.BAD_REQUEST
				})
	
				assert.strictEqual(responseBody, expectedResponseBody)
				assert.strictEqual(responseStatus, expectedResponseStatus)
			})
	
			it('should respond with INTERNAL SERVER message when unknown error was given', () => {
				//given
				const DUMMY_ERROR = 'Morty is smarter than Rick'
				const DUMMY_USER = null
				const DUMMY_INFO = null
	
				//when
				suite.handleAuthenticationMock(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)
	
				//then
				const responseStatus = suite.responseMock._getStatusCode()
				const responseBody = suite.responseMock._getData()
				
				const expectedResponseStatus = statusCodes.INTERNAL_SERVER
				const expectedResponseBody = JSON.stringify({
					description: responseMessages.errors.INTERNAL_SERVER
				})
	
				assert.strictEqual(responseBody, expectedResponseBody)
				assert.strictEqual(responseStatus, expectedResponseStatus)
			})
	
	
			it('should respond with UNAUTHORIZED ACCESS message when uncompleted or invalid params was given', () => {
				//given
				const DUMMY_ERROR = responseMessages.errors.UNAUTHORIZED
				const DUMMY_USER = null
				const DUMMY_INFO = null
				
				//when
				suite.handleAuthenticationMock(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)
	
				//then
				const responseStatus = suite.responseMock._getStatusCode()
				const responseBody = suite.responseMock._getData()
				
				const expectedResponseStatus = statusCodes.UNAUTHORIZED
				const expectedResponseBody = JSON.stringify({
					description: responseMessages.errors.UNAUTHORIZED
				})
	
				assert.strictEqual(responseBody, expectedResponseBody)
				assert.strictEqual(responseStatus, expectedResponseStatus)
			})
	
			it('should call req.logIn when user data are valid with null value as error arg ', () => {
				//given
				const DUMMY_ERROR = null
				const DUMMY_USER = sinon.stub()
				const DUMMY_INFO = null
				const handleLogInMock = suite.authenticationUtilsMock.handleLogIn

				//when
				suite.handleAuthenticationMock(DUMMY_ERROR, DUMMY_USER, DUMMY_INFO)

				//then
				assert.isTrue(suite.requestMock.logIn.calledWith(DUMMY_USER, handleLogInMock))
			})
		})
	
		describe('logIn Callback', () => {
			beforeEach(() => {
				suite.handleLogInMock = suite.authenticationUtilsMock.handleLogIn
			})
	
			it('should respond with internal server error message when error was given', () => {
				//given
				const DUMMY_ERROR = 'DUMB_ERROR'
	
				//when
				suite.handleLogInMock(DUMMY_ERROR)
	
				//then
				const responseStatus = suite.responseMock._getStatusCode()
				const responseBody = suite.responseMock._getData()
				
				const expectedResponseStatus = statusCodes.INTERNAL_SERVER
				const expectedResponseBody = JSON.stringify({
					description: responseMessages.errors.INTERNAL_SERVER
				})
	
				assert.strictEqual(responseBody, expectedResponseBody)
				assert.strictEqual(responseStatus, expectedResponseStatus)
			})
	
			it('should respond with user successfully login message when error argument is equal to null', () => {
				//given
				const DUMMY_ERROR = null
	
				//when
				suite.handleLogInMock(DUMMY_ERROR)
	
				//then
				const responseStatus = suite.responseMock._getStatusCode()
				const responseBody = suite.responseMock._getData()
				
				const expectedResponseStatus = statusCodes.OK
				const expectedResponseBody = JSON.stringify({
					description: responseMessages.successes.LOGGED_USER
				})
	
				assert.strictEqual(responseBody, expectedResponseBody)
				assert.strictEqual(responseStatus, expectedResponseStatus)			
			})
		})
	})

	
})

function createRequestMock() {
	return {
		logIn: sinon.stub()
	}
}