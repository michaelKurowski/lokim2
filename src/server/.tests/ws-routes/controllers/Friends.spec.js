const FriendsProvider = require('../../../ws-routes/controllers/Friends')
const namespaceInfo = require('../../../protocol/protocol.json').friends
const config = require('../../../config.json')
const socketClient = require('socket.io-client')
const io = require('socket.io')
const _ = require('lodash')
const sinon = require('sinon')
const CLIENT_EVENTS = namespaceInfo.eventTypes
const SERVER_PORT = config.devPropeties.httpTestPort
const SERVER_URL = `http://localhost:${SERVER_PORT}`
const SOCKET_OPTIONS = {
	transports: ['websocket'],
	'force new connection': true
}
let suite = {}

describe('Friends websocket namespace', () => {
	beforeEach(() => {
		suite = {}
		suite.server = io.listen(SERVER_PORT)
		suite.DUMMY_USERNAME = 'DUMMY_USERNAME'
		suite.userMiddlewareMock = sinon.stub().callsFake((socket, next) => {
			socket.request.user = {username: suite.DUMMY_USERNAME}
			next()
		})
		suite.server.use(suite.userMiddlewareMock)
		suite.client = {}

	})

	afterEach(done => {
		suite.server.close(done)
		if(_.isFunction(suite.client.disconnect)) suite.client.disconnect()
	})

	describe.only('#Friends list', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOne: sinon.stub()
			}
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
		})

		it('should sent event to client who requested for it', done => {
			//given
			const QUERY_FEEDBACK_MOCK = []
			const queryResultMock = {
				exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)
			}
			suite.userModelMock.findOne.returns(queryResultMock)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				connection.on(CLIENT_EVENTS.FRIENDS_LIST, data => {
					suite.emitSpy = sinon.spy(connection, 'emit')
					return suite.friendsInstance.friendsList(data, connection)
						.then(() => {
							//then
							sinon.assert.calledOnce(suite.emitSpy)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.FRIENDS_LIST)
		})

		it('should emit friendsList event type with friends list attached to it', done => {
			//given
			const QUERY_FEEDBACK_MOCK = {
				username: suite.DUMMY_USERNAME,
				friends: [
					{
						$id: 'dummyId1',
						username: 'dummyFriend1'
					},
					{
						$id: 'dummyId2',
						username: 'dummyFriend2'
					}
				]
			}

			const queryResultMock = {
				exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)
			}

			suite.userModelMock.findOne.returns(queryResultMock)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				connection.on(CLIENT_EVENTS.FRIENDS_LIST, data => {
					return suite.friendsInstance.friendsList(data, connection)
						.then(() => {

							//then
							const expectedPayload = QUERY_FEEDBACK_MOCK.friends
							sinon.assert.calledWith(suite.emitSpy, CLIENT_EVENTS.FRIENDS_LIST, expectedPayload)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.FRIENDS_LIST)
		})
	})

	
})