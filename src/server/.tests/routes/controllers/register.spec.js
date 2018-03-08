const Utilities = require('../../../routes/controllers/register')
const assert = require('chai').assert
const request = require('supertest')
const sinon = require('sinon')
const MocksUtils = require('./mocksUtils')
const userSchema = require('../../../schemas/user')

let suite = null

//TODO Mock res & req objects
describe('register controller', () => {
	afterEach(() => {
		suite = {}
		suite.responseMock = MocksUtils.createResponseMock(sinon)
		suite.requestMock = MocksUtils.createResponseMock(sinon)
		suite.userModelMock = MocksUtils.createMongooseModel()
	})

	describe('POST', () => {
		it('should respond with user creation failure when no email is provided', () => {
			
		})

		it('should respond with user creation failure when no username is provided', () => {
			
		})

		it('should respond with user creation failure when no password is provided', () => {
			
		})
	})
})