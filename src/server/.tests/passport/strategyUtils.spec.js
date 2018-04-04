const strategyUtils = require('../../passport/strategyUtils')
const responseManager = require('../../routes/controllers/utilities/responseManager')
const assert = require('chai').assert
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const EventEmitter = require('events').EventEmitter

let suite = {}
describe('StrategyUtils', () => {
	beforeEach(() => {
		suite = {}
	})

	describe('#strategyHandlers', () => {
		beforeEach(() => {
			suite.requestMock = createRequestMock()
			suite.nextSpy = sinon.spy()
			suite.responseMock = httpMocks.createResponse({
				eventEmitter: EventEmitter
			})
			suite.strategyHandlersMock = strategyUtils.strategyHandlers(suite.requestMock, suite.responseMock, suite.nextSpy)
		})
		describe('#serializeHandler', () => {
			it('should call next when no error is given', () => {
				//given
				const error = null

				//when
				suite.strategyHandlersMock.serializeHandler(error)

				//then
				assert.isTrue(suite.nextSpy.calledOnce)
			})

			it('should respond with error status code and description', () => {
				//given
				const error = {
					code: 401,
					description: 'UNAUTHORIZED'
				}

				//when
				suite.strategyHandlersMock.serializeHandler(error)

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

		describe('#loginStrategyHandler', () => {
			it('should respond with error status code and description, when error is given', () => {
				//given
				const error = {
					code: 401,
					description: 'UNAUTHORIZED'
				}
				const userInstance = {}
				const info = null

				//when
				suite.strategyHandlersMock.loginStrategyHandler(error, userInstance, info)

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

			it('should respond with {description: UNATHORIZED , code: 401}, when userInstance is null', () => {
				//given
				const error = null
				const userInstance = null
				const info = null

				//when
				suite.strategyHandlersMock.loginStrategyHandler(error, userInstance, info)

				//then
				const statusCode = suite.responseMock._getStatusCode()
				const payload = suite.responseMock._getData()

				const expectedError =  responseManager.MESSAGES.errors.UNAUTHORIZED
				const expectedStatusCode = expectedError.code
				const expectedPayload = JSON.stringify({
					description: expectedError.description
				})

				assert.strictEqual(statusCode, expectedStatusCode)
				assert.strictEqual(payload, expectedPayload)

			})

			it('should call req.logIn with arguments userInstance and serializeHandler, when was passed correct userInstance without any error', () => {
				//given
				const error = null
				const userInstance = {
					username: 'Rick',
					password: 'TheSmartestPersonInMultiUniverse'
				}
				const info = null

				//when
				suite.strategyHandlersMock.loginStrategyHandler(error, userInstance, info)

				//then
				const logInSpy = suite.requestMock.logIn
				assert.isTrue(logInSpy.calledOnce)
			})
		})
	})

	describe.only('#validateUserPassword', () => {
		beforeEach(() => {
			suite.userInstance = {
				password: '528bb9348a1c04089df122608b4cad7618daf48df66efbada15d982853ed016f',
				salt: 'someSaltySalt'
			}
			suite.doneSpy = sinon.spy()
			suite.validateUserPasswordMock = strategyUtils.validateUserPassword
		})

		it('should call done with error = null and correct userInstance as arguments, when password from request and from userInstance is the same', () => {
			//given
			const error = null
			const requestPassowrd = 'ImPickleRick'

			//when
			suite.validateUserPasswordMock(suite.userInstance, requestPassowrd, suite.doneSpy)

			//then
			assert.isTrue(suite.doneSpy.calledWith(error, suite.userInstance))
		})

		it('should call done with error UNAUTHORIZED and NULL userInstance as arguments, when password from request and from userInstance is NOT the same', () => {
			//given
			const error = responseManager.MESSAGES.errors.UNAUTHORIZED
			const requestPassowrd = 'ImNotPickleRick'

			//when
			suite.validateUserPasswordMock(suite.userInstance, requestPassowrd, suite.doneSpy)

			//then
			const userInstance = null
			assert.isTrue(suite.doneSpy.calledWith(error, userInstance))
		})
	})
})

function createRequestMock() {
	return {
		logIn: sinon.spy()
	}
}