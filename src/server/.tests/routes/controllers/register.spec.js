const registerController = require('../../../routes/controllers/register')
const assert = require('chai').assert
const sinon = require('sinon')
const MocksUtils = require('./MocksUtils')
//const userSchema = require('../../../schemas/user')
const httpMocks = require('node-mocks-http')
const errorMessages = require('../../../routes/controllers/utilities/errorMessages')

let suite = null

//TODO Mock res & req objects using node-mocks-http
describe('register controller', () => {
	beforeEach(() => {
		suite = {}
		suite.URL = '/register'
		suite.responseMock = httpMocks.createResponse()
		suite.userModelMock = MocksUtils.createMongooseModel()
	})
	afterEach(() => {
		suite = null
	})

	describe('POST', () => {
		beforeEach(() => {
			suite.METHOD = 'POST'
			suite.registerPostController = registerController.post(suite.userModelMock)
			suite.DUMMY_USERNAME = 'Rick'
			suite.DUMMY_PASSWORD = 'ImPickleRick'
			suite.DUMMY_EMAIL = 'morty@ricks-confederation.com'
		})

		it('should respond with user creation failure when nothing is provided', () => {
			//given
			const requestMock = httpMocks.createRequest({
				method: suite.METHOD,
				url: suite.URL,
				params: {}
			})

			//when
			suite.registerPostController(requestMock, suite.responseMock)

			//then
			const responseBody = suite.responseMock._getData()
			const expectedResponseBody = {
				description: errorMessages.FAILED_TO_CREATE_USER
			}

			assert.deepEqual(responseBody, expectedResponseBody)
		})

		it('should respond with user creation failure when no email is provided', () => {
			//given
			const requestMock = httpMocks.createRequest({
				method: suite.METHOD,
				url: suite.URL,
				params: {
					username: suite.DUMMY_USERNAME,
					password: suite.DUMMY_PASSWORD
				}
			})

			//when
			suite.registerPostController(requestMock, suite.responseMock)

			//then
			const responseBody = suite.responseMock._getData()
			const expectedResponseBody = {
				description: errorMessages.FAILED_TO_CREATE_USER
			}

			assert.deepEqual(responseBody, expectedResponseBody)
		})

		it('should respond with user creation failure when no password is provided', () => {
			//given
			const requestMock = httpMocks.createRequest({
				method: suite.METHOD,
				url: suite.URL,
				params: {
					username: suite.DUMMY_USERNAME,
					email: suite.DUMMY_EMAIL
				}
			})

			//when
			suite.registerPostController(requestMock, suite.responseMock)

			//then
			const responseBody = suite.responseMock._getData()
			const expectedResponseBody = {
				description: errorMessages.FAILED_TO_CREATE_USER
			}

			assert.deepEqual(responseBody, expectedResponseBody)
		})

		it('should respond with user creation failure when no username is provided', () => {
			//given
			const requestMock = httpMocks.createRequest({
				method: suite.METHOD,
				url: suite.URL,
				params: {
					username: suite.DUMMY_USERNAME,
					email: suite.DUMMY_EMAIL
				}
			})

			//when
			suite.registerPostController(requestMock, suite.responseMock)

			//then
			const responseBody = suite.responseMock._getData()
			const expectedResponseBody = {
				description: errorMessages.FAILED_TO_CREATE_USER
			}

			assert.deepEqual(responseBody, expectedResponseBody)
		})
	})
})