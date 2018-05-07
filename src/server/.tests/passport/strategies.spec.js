const strategiesProvider = require('../../passport/strategies')
const sinon = require('sinon')
const assert = require('chai').assert

let suite
describe('passport strategies', () => {
	beforeEach(() => {
		suite = {}
		suite.FAKE_FIND_BY_ID_RESULT = 'fakeUsr'
		suite.userModelMock = {findById: sinon.stub().returns(suite.FAKE_FIND_BY_ID_RESULT)}
		suite.strategiesUtilsMock = {}
		suite.loginStrategy = strategiesProvider.loginStrategy(suite.userModelMock, suite.strategiesUtilsMock)
	})
	describe('login strategy', () => {
		describe('validateUser', () => {
			//TODO
		})

		describe('#serializeUser', () => {
			it('should extract user Id from deserialized object and pass it to next middleware', () => {
				//given
				const USER_ID = 'randomUserId'
				const ERROR = null
				const userMock = {id: USER_ID}
				const done = sinon.spy()
	
				//when
				suite.loginStrategy.serializeUser(userMock, done)
	
				//then
				sinon.assert.calledWith(done, ERROR, USER_ID)
			})
		})

		describe('#deserializeUser', () => {
			it('should deserialize user by finding user with certain ID in db', () => {
				//given
				const userMock = {}
				const done = sinon.stub()
	
				//when
				const deserializedUser = suite.loginStrategy.deserializeUser(userMock, done)
	
				//then
				assert.strictEqual(deserializedUser, suite.FAKE_FIND_BY_ID_RESULT)
			})
		})
	})
})