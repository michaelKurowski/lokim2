const logInUser = require('../../../../routes/controllers/Middlewares/logInUser')
const assert = require('chai').assert
const sinon = require('sinon')

let suite = {}

describe('logInUser', () => {
	beforeEach(() => {
		suite = {}
		suite.passportMock = createPassportMock()
		suite.loginUserMock = logInUser(suite.passportMock)
		suite.responseMock = sinon.stub()
		suite.nextSpy = sinon.spy()
		suite.authenticatio

	})
	it('should skip to next middleware by calling next() when user is already logged in ', () => {
		//given
		const requestMock = {
			isAuthenticated: () => true
		}
		
		//when
		suite.loginUserMock(requestMock, suite.responseMock, suite.nextSpy)

		//then
		const authenticateSpy = suite.passportMock.authenticate
		assert.isTrue(suite.nextSpy.calledOnce)
		assert.isFalse(authenticateSpy.calledOnce)
	})

	it('should call passport authentication with creditinals, when user is not logged', () => {
		//given
		const requestMock = {
			isAuthenticated: () => false
		}
			
		//when
		suite.loginUserMock(requestMock, suite.responseMock, suite.nextSpy)
	
		//then
		const authenticateSpy = suite.passportMock.authenticate
		assert.isTrue(authenticateSpy.calledOnce)
	})

})


function createPassportMock() {
	const authenticateStub = sinon.stub().returns(() => {})
	return {
		authenticate: sinon.spy(authenticateStub)
	}
}