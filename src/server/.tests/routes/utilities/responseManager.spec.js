const responseManager = require('../../../routes/controllers/utilities/responseManager')
const assert = require('chai').assert
const httpMocks = require('node-mocks-http')
const EventEmitter = require('events').EventEmitter

let suite ={}

describe('responseManager', () => {
	beforeEach(() => {
		suite = {}
		suite.responeMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
	})

	describe('#sendResponse', () => {
		beforeEach(() => {
			suite.sendResponseMock = responseManager.sendResponse
		})
		it('Should send response with given status code and description. Message status and description was taken from MESSAGES dictionary', () => {
			//given
			const message = {
				code: 401,
				description: 'UNAUTHORIZED'
			}

			//when
			suite.sendResponseMock(suite.responeMock, message)

			//then
			const statusCode = suite.responeMock._getStatusCode()
			const payload = suite.responeMock._getData()
			const excpectedStatusCode = message.code
			const expectedPayload = JSON.stringify({
				description: message.description
			})

			assert.strictEqual(statusCode, excpectedStatusCode)
			assert.strictEqual(payload, expectedPayload)
		})
	})
})