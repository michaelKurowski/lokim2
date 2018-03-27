const assert = require('chai').assert
const sinon = require('sinon')
const passportUtils = require('../../passport/passportUtils')
const msg = require('../../routes/controllers/utilities/responseMessages')
let suite = {}


describe('passportMiddleware', () => {
	beforeEach(() => {
		suite.DUMMY_USERNAME = 'Rick'
		suite.DUMMY_PASSWORD = '8464c69bfc8c8965db5553d9e8485973538a546dfa72d55805d289eadfcdf155'
		suite.DUMMY_SALT = 'DUMMY_SALT_123'
		suite.doneStub = sinon.stub()

		suite.userMock = {
			username: suite.DUMMY_USERNAME,
			password: suite.DUMMY_PASSWORD,
			salt: suite.DUMMY_SALT
		}
	})

	describe('When index exist in database', () => {
		it('should call function done with error null and user instance', () => {
			//given
			const DUMMY_PASSWORD = 'ImPickleRick'
			const handleFindUserMock = passportUtils.handleFindUser(suite.DUMMY_USERNAME, DUMMY_PASSWORD, suite.doneStub)

			//when
			handleFindUserMock.thenCallback(suite.userMock)

			//then
			assert.isTrue(suite.doneStub.calledWith(null, suite.userMock))
		})

		it('should call function done with Unauthorized error', () => {
			//given
			const DUMMY_PASSWORD = 'MortyIsSmarterThanRick'
			const handleFindUserMock = passportUtils.handleFindUser(suite.DUMMY_USERNAME, DUMMY_PASSWORD, suite.doneStub)
		
			//when
			handleFindUserMock.thenCallback(suite.userMock)
		
			//then
			assert.isTrue(suite.doneStub.calledWith(msg.errors.UNAUTHORIZED))
		})
	})

	describe('When index not exist in database', () => {
		it('Should call function with Bad request error', () => {
			//given
			const DUMMY_ERROR = msg.errors.BAD_REQUEST
			const handleFindUserMock = passportUtils.handleFindUser(suite.DUMMY_USERNAME, suite.DUMMY_PASSWORD, suite.doneStub)
		
			//when
			handleFindUserMock.catchCallback(DUMMY_ERROR)
		
			//then
			assert.isTrue(suite.doneStub.calledWith(msg.errors.BAD_REQUEST))
		})
	})
})
	