const logInUser = require('../../../routes/controllers/logInUser')
const sinon = require('sinon')
const assert = require('chai').assert

let suite = {}
describe('logInUser', () => {
	beforeEach(() => {
		suite = {}
		suite.passportMock = createPassportMock()
		suite.loginUserMock = logInUser(suite.passportMock)
	})

	it('should call passport authentication', () => {
		//given
		const requestMock = JSON.stringify({
			username: 'Rick',
			password: 'RickestPassword'
		})
		const responseMock = sinon.stub()
		const nextMock = sinon.stub()

		//when
		suite.loginUserMock(requestMock, responseMock, nextMock)

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
