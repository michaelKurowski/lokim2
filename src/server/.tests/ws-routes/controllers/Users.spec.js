const UsersProvider = require('../../../ws-routes/controllers/Users')
const sinon = require('sinon')
const UserModel = require('../../../models/user')
const namespaceInfo =  require('../../../protocol/protocol.json').users
const EVENT_TYPES = namespaceInfo.eventTypes

let suite = {}
let sandbox = sinon.sandbox.create()
describe('Users websocket namespace', () => {
	beforeEach(() => {
		suite = {}
		suite.usersInstance = new UsersProvider()
	})

	afterEach(() => {
		sandbox.restore()
	})

	describe('#find', () => {
		beforeEach(() => {
			suite.mongooseQuery = sinon.stub()
		})
		it('should call a response to client who sent event', () => {
			//given
			const QUERY_PHRASE = 'dummyUsername'
			const QUERY_FEEDBACK_MOCK = []

			const socketMock = {emit: sinon.spy()}
			const queryResultMock = {exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)}
			sandbox.stub(UserModel, 'find').returns(queryResultMock)
			suite.usersInstance = new UsersProvider(UserModel)
			//when
			return suite.usersInstance.find({queryPhrase: QUERY_PHRASE}, socketMock)
				.then(() => {
					//then
					sinon.assert.calledOnce(socketMock.emit)
				})
		})

		it('should send back users found in database', () => {
			//given
			const QUERY_PHRASE = 'dummyUsername'

			const FOUND_USERNAME1 = 'dummyUsername'
			const FOUND_USERNAME2 = 'dummyUsername2'
			const QUERY_FEEDBACK_MOCK = [
				{
					$id: 'fakeMongoDBId',
					username: FOUND_USERNAME1
				},
				{
					$id: 'fakeMongoDBId2',
					username: FOUND_USERNAME2
				}
			]

			const EXPECTED_DATA_TO_BE_SEND_TO_USER = {
				foundUsernames: [FOUND_USERNAME1, FOUND_USERNAME2]
			}

			const socketMock = {emit: sinon.spy()}
			const queryResultMock = {exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)}
			sandbox.stub(UserModel, 'find').returns(queryResultMock)
			suite.usersInstance = new UsersProvider(UserModel)
			//when
			return suite.usersInstance.find({queryPhrase: QUERY_PHRASE}, socketMock)
				.then(() => {
					//then
					sinon.assert.calledWith(socketMock.emit, EVENT_TYPES.FIND, EXPECTED_DATA_TO_BE_SEND_TO_USER)
				})
		})
	})

})