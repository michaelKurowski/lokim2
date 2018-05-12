const config = require('../../config.json')
let suite
describe('application startup', () => {
	beforeEach('starting server instance for test', async () => {
		suite = {}
		suite.application = await require('../../init')({httpPort: config.devPropeties.httpTestPort})
	})

	afterEach('clearing network connections after test', () => {
		suite.application.dbConnection.close()
		return suite.application.httpServerListening
			.then(listening => listening.close())
	})

	it('should connect to db without errors', () => {
		return suite.application.dbConnection
	})

	it('should connect start HTTP server with no issues', () => {
		return suite.application.httpServerListening
	})
})