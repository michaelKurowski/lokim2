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
			suite.loginUtilsMock = createLoginUtilskMock()
			suite.createPostLoginController = loginController.post(suite.passportMock, suite.loginUtilsMock)
			suite.isAuthenticatedPOSITIVE= () => true
			suite.isAuthenticatedFAILURE = () => false
		})

		it('should respond with successfully login message when cookie with correct session was given', () => {
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
		})

		it('should call authentication callback to login strategy when cookie session is expired or cookie is not given', () => {
			//given
			const requestMock = {
				isAuthenticated: suite.isAuthenticatedFAILURE
			}
			
			//when
			suite.createPostLoginController(requestMock, suite.responseMock, suite.nextMock)

			//then
			const passportMockAuthenticateCall = suite.passportMock.authenticate.getCall(0)
			const handleAuthenticationStub = suite.loginUtilsMock.authenticationUtils().handleAuthentication

			assert.isTrue(passportMockAuthenticateCall.calledWith(
				passportStrategiesNames.LOGIN_STRATEGY, 
				handleAuthenticationStub))
		})
	})

	function createLoginUtilskMock() {
		return {
			authenticationUtils: () => {
				return {
					handleAuthentication: 'mocked authenticate callback'
				}
			}
		}
	}

	function createPassportMock() {
		const authenticateStub = sinon.stub().returns(() => {})
		return {
			authenticate: sinon.spy(authenticateStub)
		}
	}		
})