const strategyUtils = require('../../../passport/strategyUtils')
const responseManager = require('../../../routes/controllers/utilities/responseManager')
const assert = require('chai').assert

let suite = {}
describe('StrategyUtils', () => {
	beforeEach(() => {
		suite = {}
	})

	describe('#validateUserPassword', () => {
		beforeEach(() => {
			suite.userInstance = {
				password: '528bb9348a1c04089df122608b4cad7618daf48df66efbada15d982853ed016f',
				salt: 'someSaltySalt'
			}
			suite.validateUserPasswordMock = strategyUtils.validateUserPassword
		})

		it('should return no error, when password from request and from userInstance is the same', () => {
			//given
			const exceptedError = null
			const requestPassword = 'ImPickleRick'

			//when
			const validationResult = suite.validateUserPasswordMock(suite.userInstance, requestPassword)

			//then
			assert.strictEqual(validationResult, exceptedError)
		})

		it('should return error UNAUTHORIZED, when password from request and from userInstance is NOT the same', () => {
			//given
			const exceptedError = responseManager.MESSAGES.errors.UNAUTHORIZED
			const requestPassword = 'ImNotPickleRick'

			//when
			const validationResult = suite.validateUserPasswordMock(suite.userInstance, requestPassword)

			//then
			assert.strictEqual(validationResult, exceptedError)
		})
	})
})