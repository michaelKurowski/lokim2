class MocksUtils {
	constructor() {

	}

	static createResponseMock(sinon) {
		const newMock = {}
		newMock.send = function (messageToSend) {

		}
		return {
			send: sinon.spy(),
			status: sinon.spy()
		}
	}

	static createRequestMock() {

	}

	static createMongooseModel(schema) {
		
	}
}

module.exports = MocksUtils