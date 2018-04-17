//const assert = require('chai').assert
//const logger = require('../../logger')
let suite
describe('application startup', () => {
	beforeEach(() => {
		suite = {}
		suite.application = require('../../index')
	})

	afterEach(() => {
		suite.application.httpServer.close()
		suite.application.dbConnection.close()
	})

	it('should connect to db without errors', () => {
		return suite.application.dbConnection
	})
})