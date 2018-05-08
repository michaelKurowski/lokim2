const strategiesProvider = require('../../passport/strategies')
const responseManager = require('../../routes/controllers/utilities/responseManager')
const sinon = require('sinon')
const assert = require('chai').assert

let suite
describe('passport strategies', () => {
	beforeEach(() => {
		suite = {}
		suite.FAKE_FIND_BY_ID_RESULT = 'fakeUser'
		suite.userModelMock = {
			findById: sinon.stub().returns(suite.FAKE_FIND_BY_ID_RESULT)
		}
		suite.strategiesUtilsMock = {}
		suite.loginStrategy = strategiesProvider.loginStrategy(suite.userModelMock, suite.strategiesUtilsMock)
	})
	describe('login strategy', () => {
		describe('validateUser', () => {
			it('should pass to next middleware validation message returned by strategiesUtils.validateUserPassword() and user found by mongoose query', () => {
				//given
				const USERNAME = 'dummyUsername'
				const PASSWORD = 'dummyPassword'
				const doneCallback = sinon.spy()
				const PASSWORD_VALIDATION_RESULT = responseManager.MESSAGES.errors.UNAUTHORIZED
				const mongooseQuery = {
					exec: sinon.stub().returns(Promise.resolve(suite.FAKE_FIND_BY_ID_RESULT))
				}
				suite.userModelMock = {findOne: sinon.stub().returns(mongooseQuery)}

				suite.strategiesUtilsMock = {
					validateUserPassword: sinon.stub().returns(PASSWORD_VALIDATION_RESULT)
				}
				suite.loginStrategy =
					strategiesProvider.loginStrategy(suite.userModelMock, suite.strategiesUtilsMock)

				//when
				return suite.loginStrategy.validateUser(USERNAME, PASSWORD, doneCallback)
					.then(() => {
						//then
						sinon.assert.calledWith(doneCallback, PASSWORD_VALIDATION_RESULT, suite.FAKE_FIND_BY_ID_RESULT)
					})
			})

			it('should pass fail autorization if error occured in strategiesUtils.validateUserPassword(), and username equal to null', () => {
				//given
				const USERNAME = 'dummyUsername'
				const PASSWORD = 'dummyPassword'
				const doneCallback = sinon.spy()
				const PASSWORD_VALIDATION_RESULT = responseManager.MESSAGES.errors.UNAUTHORIZED
				const EXPECTED_FOUND_USER = null
				const mongooseQuery = {
					exec: sinon.stub().returns(Promise.resolve(suite.FAKE_FIND_BY_ID_RESULT))
				}
				suite.userModelMock = {findOne: sinon.stub().returns(mongooseQuery)}

				suite.strategiesUtilsMock = {
					validateUserPassword: sinon.stub().throws()
				}
				suite.loginStrategy =
					strategiesProvider.loginStrategy(suite.userModelMock, suite.strategiesUtilsMock)

				//when
				return suite.loginStrategy.validateUser(USERNAME, PASSWORD, doneCallback)
					.then(() => {
						//then
						sinon.assert.calledWith(doneCallback, PASSWORD_VALIDATION_RESULT, EXPECTED_FOUND_USER)
					})
			})
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