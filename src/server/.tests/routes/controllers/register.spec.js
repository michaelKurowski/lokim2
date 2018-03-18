const registerController = require('../../../routes/controllers/register')
const assert = require('chai').assert
const sinon = require('sinon')
const httpMocks = require('node-mocks-http')
const responseMessages = require('../../../routes/controllers/utilities/responseMessages')
const statusCodes = require('../../../routes/controllers/utilities/statusCodes')
const EventEmitter = require('events').EventEmitter
let suite = {}

//TODO Mock res & req objects using node-mocks-http
describe('register controller', () => {
	beforeEach(() => {
		suite = {}
		suite.URL = '/register'
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})

	describe('POST', () => {
		beforeEach(() => {
			suite.METHOD = 'POST'
			suite.DUMMY_USERNAME = 'Rick'
			suite.DUMMY_PASSWORD = 'ImPickleRick'
			suite.DUMMY_EMAIL = 'morty@ricks-confederation.com'
		})
		describe('mongoose creation handling', () => {
			beforeEach(() => {
				suite.registerPostFailingController = registerController.post(createMongooseModelMock(true))
				suite.registerPostSuccessfulController = registerController.post(createMongooseModelMock(false))
			})

			it('should respond with user creation failure when all required data is provided and model validation fails', done => {
				//given
				const requestMock = httpMocks.createRequest({
					method: suite.METHOD,
					url: suite.URL,
					params: {
						username: suite.DUMMY_USERNAME,
						email: suite.DUMMY_EMAIL,
						password: suite.DUMMY_PASSWORD
					}
				})
				suite.responseMock.on('send', then)
				
				//when
				suite.registerPostFailingController(requestMock, suite.responseMock)

				//then
				function then() {
					const responseBody = suite.responseMock._getData()
					const expectedResponseBody = JSON.stringify({
						description: responseMessages.errors.FAILED_TO_CREATE_USER
					})
					assert.deepEqual(responseBody, expectedResponseBody)
					done()
				}
			})

			it('should respond with user creation success when all required data is provided and model validation finishes successfuly', done => {
				//given
				const requestMock = httpMocks.createRequest({
					method: suite.METHOD,
					url: suite.URL,
					params: {
						username: suite.DUMMY_USERNAME,
						email: suite.DUMMY_EMAIL,
						password: suite.DUMMY_PASSWORD
					}
				})
				//when
				suite.registerPostSuccessfulController(requestMock, suite.responseMock)

				//then
				suite.responseMock.on('send', () => {
					const responseBody = suite.responseMock._getData()
					const expectedResponseBody = JSON.stringify({
						description: responseMessages.successes.USER_HAS_BEEN_CREATED
					})

					assert.deepEqual(responseBody, expectedResponseBody)
					done()
				})

			})
		})
	})
})

function createMongooseModelMock(isValidationFailuring) {
	return function() {
		this.save = () => 
			new Promise((resolve, reject) => 
				isValidationFailuring ? reject('mocked reject') : resolve('mocked success')	
			)
	}

}