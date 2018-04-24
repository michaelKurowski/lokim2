//const assert = require('chai').assert
//const logger = require('../../logger')
let suite
describe('application startup', () => {
	beforeEach(() => {
		suite = {}
		suite.application = require('../../index')
	})

	afterEach(done => {
		//TODO: Avoid failing hooks when there are errors during index.js evalution
		suite.application.httpServer
			.then(httpListening => {
				httpListening.close()
				done()
			})
		suite.application.dbConnection.close()
	})

	it('should connect to db without errors', () => {
		return suite.application.dbConnection
	})

	it('should connect start HTTP server with no issues', () => {
		return suite.application.httpServer
	})
})