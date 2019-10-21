const registerController = require('../../../../routes/controllers/register')
const assert = require('chai').assert
const httpMocks = require('node-mocks-http')
const sinon = require('sinon')
const responseManager = require('../../../../routes/controllers/utilities/responseManager')

const EventEmitter = require('events').EventEmitter
let suite = {}

describe('register controller', () => {
	beforeEach(() => {
		suite = {}
		suite.URL = '/register'
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
		suite.DUMMY_TRANSPORT = {
            sendMail: sinon.spy()
        }
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
				suite.registerPostFailingController = 
					registerController.post(createMongooseModelMock(true), createVerifyModelMock(true), suite.DUMMY_TRANSPORT)

				suite.registerPostSuccessfulController =
					registerController.post(createMongooseModelMock(false), createVerifyModelMock(false), suite.DUMMY_TRANSPORT)
			})

			it('should respond with user creation failure when all required data is provided and model validation fails', done => {
				//given
				const RESPONSE_EVENT_TYPE = 'send'
				const requestMock = httpMocks.createRequest({
					method: suite.METHOD,
					url: suite.URL,
					body: {
						username: suite.DUMMY_USERNAME,
						email: suite.DUMMY_EMAIL,
						password: suite.DUMMY_PASSWORD
					}
				})
				suite.responseMock.on(RESPONSE_EVENT_TYPE, then)

				//when
				suite.registerPostFailingController(requestMock, suite.responseMock)

				//then
				function then() {
					const responseBody = suite.responseMock._getData()
					const expectedResponseBody = JSON.stringify({
						DESCRIPTION: responseManager.MESSAGES.ERRORS.BAD_REQUEST.DESCRIPTION
					})
					assert.strictEqual(responseBody, expectedResponseBody)
					done()
				}
			})

			it('should respond with user creation success when all required data is provided and model validation finishes successfuly', done => {
				//given
				const RESPONSE_EVENT_TYPE = 'send'
				const requestMock = httpMocks.createRequest({
					method: suite.METHOD,
					url: suite.URL,
					body: {
						username: suite.DUMMY_USERNAME,
						email: suite.DUMMY_EMAIL,
						password: suite.DUMMY_PASSWORD
					}
				})

				suite.responseMock.on(RESPONSE_EVENT_TYPE, then)

				//when
				suite.registerPostSuccessfulController(requestMock, suite.responseMock)

				//then
				function then() {
					const responseBody = suite.responseMock._getData()
					const expectedResponseBody = JSON.stringify({
						DESCRIPTION: responseManager.MESSAGES.SUCCESSES.OK.DESCRIPTION
					})
					assert.strictEqual(responseBody, expectedResponseBody)
					done()
				}
			})
		})
	})
})

function createMongooseModelMock(isValidationFailing) {
	return function() {
		this.save = () => 
			new Promise((resolve, reject) => 
				isValidationFailing ? reject('mocked reject') : resolve('mocked success')	
			)
	}

}

function createVerifyModelMock(isValidationFailing){
	return function(){
		this.save = () =>
			new Promise((resolve,reject) =>
				isValidationFailing ? reject('mocked reject') : resolve('mocked success')
			)
	}
}