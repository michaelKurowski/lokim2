const loginController = require('../../../routes/controllers/login')
const passportStrategiesNames = require('../../../passport/strategiesNames')
const assert = require('chai').assert
const httpMocks = require('node-mocks-http')
const statusCodes = require('../../../routes/controllers/utilities/statusCodes')
const responseMessages = require('../../../routes/controllers/utilities/responseMessages')
const sinon = require('sinon')
const EventEmitter = require('events').EventEmitter
let suite = {}

describe('login controller', () => {

	beforeEach(() => {
		suite = {}
		suite.URL = '/login'
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})

	describe('POST', () => {
		
		beforeEach(() => {
			suite.METHOD = 'POST'
			suite.nextMock = sinon.stub()
			suite.passportMock = createPassportMock()
			suite.passportCallbackMock = createPassportCallbackMock()
			suite.createPostLoginController = loginController.post(suite.passportMock, suite.passportCallbackMock)
			suite.isAuthenticatedPOSITIVE= () => true
			suite.isAuthenticatedFAILURE = () => false
		})

		it('should respond with successfully login when cookie with correct session was given', done => {

			//given
		
			const requestMock = {
				isAuthenticated: suite.isAuthenticatedPOSITIVE
			}
			
			//when
			suite.createPostLoginController(requestMock, suite.responseMock, suite.nextMock)

			//then
			const responseStatus = suite.responseMock._getStatusCode()
			const responseBody = suite.responseMock._getData()

			const expectedResponseStatus = statusCodes.OK
			const expectedResponseBody = JSON.stringify({
				description: responseMessages.successes.LOGGED_USER
			})


			assert.equal(responseStatus, expectedResponseStatus)
			assert.strictEqual(responseBody, expectedResponseBody)
			done()
		})

		it('should be called authentication callback when cookie session is expired or cookie is not given', done => {

			//given
			const requestMock = {
				isAuthenticated: suite.isAuthenticatedFAILURE
			}
			
			
			//when
			suite.createPostLoginController(requestMock, suite.responseMock, suite.nextMock)


			//then
			assert.isTrue(suite.passportMock.authenticate.getCall(0).calledWith(
				passportStrategiesNames.LOGIN_STRATEGY, 
				suite.passportCallbackMock.authenticateCallback()))


			assert.isTrue(suite.passportCallbackMock.authenticateCallback.getCall(0).calledWith(
				requestMock, 
				suite.responseMock))

			done()
		})


	})

	function createPassportCallbackMock() {
		return {
			authenticateCallback: sinon.stub().returns(() => {return 'Mocked callback'})
		}
	}

	function createPassportMock() {
		const authenticateStub = sinon.stub().returns((a, b, c) => {})
		return {
			authenticate: sinon.spy(authenticateStub)
		}
	}
	
		
})