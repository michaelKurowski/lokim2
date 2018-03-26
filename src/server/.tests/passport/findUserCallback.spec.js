const assert = require('chai').assert
const sinon = require('sinon')
const findUserCallback = require('../../passport/findUserCallback')
const msg = require('../../routes/controllers/utilities/responseMessages')
let suite = {}


describe('passportMiddleware', () => {

	beforeEach(() => {
		suite.DUMMY_USERNAME = 'Rick'
		suite.DUMMY_PASSWORD = '8464c69bfc8c8965db5553d9e8485973538a546dfa72d55805d289eadfcdf155' // ImPickleRick
		suite.DUMMY_SALT = 'DUMMY_SALT_123'
		suite.doneStub = sinon.stub()

		suite.userMock = {
			username: suite.DUMMY_USERNAME,
			password: suite.DUMMY_PASSWORD,
			salt: suite.DUMMY_SALT
		}
	})

	describe('When index exist in database', () => {
			
		it('should return function done with error null and user instance', done => {

			//given
			const DUMMY_PASSWORD = 'ImPickleRick'
			const findUserCallbackMock = findUserCallback(suite.DUMMY_USERNAME, DUMMY_PASSWORD, suite.doneStub)


			//when
			findUserCallbackMock.thenCallback(suite.userMock)

			//then
			assert.isTrue(suite.doneStub.calledWith(null, suite.userMock))

			done()
		})

		it('should return function done with Unauthorized error', done => {

			//given
			const DUMMY_PASSWORD = 'MortyIsSmarterThanRick'
			const findUserCallbackMock = findUserCallback(suite.DUMMY_USERNAME, DUMMY_PASSWORD, suite.doneStub)
		
		
			//when
			findUserCallbackMock.thenCallback(suite.userMock)
		
			//then
			assert.isTrue(suite.doneStub.calledWith(msg.errors.UNAUTHORIZED, false))
		
			done()

		})

	

	})

	describe('When index not exist in database', () => {

		it('Should return function with Bad request error', done => {
			//given
			const DUMMY_ERROR = msg.errors.BAD_REQUEST
			const findUserCallbackMock = findUserCallback(suite.DUMMY_USERNAME, suite.DUMMY_PASSWORD, suite.doneStub)
		
		
			//when
			findUserCallbackMock.catchCallback(DUMMY_ERROR)
		
			//then
			assert.isTrue(suite.doneStub.calledWith(msg.errors.BAD_REQUEST, false))
		
			done()


		})

	})

})
	