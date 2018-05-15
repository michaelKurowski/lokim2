const RoomProvider = require('../../../ws-routes/controllers/Users')
const sinon = require('sinon')

let suite = {}
describe('Users websocket namespace', () => {
	beforeEach(() => {
		suite = {}
	})
	describe('unit tests', () => {
		beforeEach(() => {
			suite.mongooseQuery = sinon.stub()
		})
		describe('#find', () => {
			it('should send back user found in database', () => {
				//given

				//when

				//then
			})
		})
	})
})