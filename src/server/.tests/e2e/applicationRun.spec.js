const assert = require('chai').assert
let suite
describe('application startup', () => {
	beforeEach(() => {
		suite = {}
		suite.application = require('../../index')
	})

	afterEach(() => {
		suite.application.httpServer.close()
	})

	it('should not throw any db connection errors', () => {
		return suite.application.dbConnection.catch(err => {
			assert.isNull(err)
		})
	})
})