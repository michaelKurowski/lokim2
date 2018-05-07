const strategiesProvider = require('../../passport/strategies')
const sinon = require('sinon')

let suite
describe('passport strategies', () => {
	beforeEach(() => {
		suite = {}
		suite.userModelMock = {}
		suite.strategiesUtilsMock = {}
		suite.loginStrategy = strategiesProvider.loginStrategy(suite.userModelMock, suite.strategiesUtilsMock)
	})
	describe('login strategy', () => {
		describe('#serializeUser', () => {
			it('should extract user Id from deserialized object and pass it to next middleware', () => {
				//given
				const USER_ID = 'randomUserId'
				const ERROR = null
				const user = {id: USER_ID}
				const done = sinon.spy()
	
				//when
				suite.loginStrategy.serializeUser(user, done)
	
				//then
				sinon.assert.calledWith(done, ERROR, USER_ID)
			})
		})
	})
})