//const assert = require('chai').assert
//const logger = require('../../logger')
let suite
describe('application startup', () => {
	beforeEach(() => {
		suite = {}
		suite.application = require('../../init')()
	})

	afterEach(done => {
		//TODO: Avoid failing hooks when there are errors during index.js evalution
		suite.application.httpServerListening
			.then(listening => {
				if (!listening) return done()
				listening.close()
				done()
			})
		suite.application.dbConnection.close()
	})

	it('should connect to db without errors', () => {
		return suite.application.dbConnection
	})

	it('should connect start HTTP server with no issues', () => {
		return suite.application.httpServerListening
	})
})