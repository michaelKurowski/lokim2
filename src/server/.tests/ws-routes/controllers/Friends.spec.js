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

	describe('#Friends list', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOne: sinon.stub()
			}
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
		})

		it('should emit message with friends list to user', done => {
			//given
			const DUMMY_FRIENDS_ARRAY = [
				{
					$id: 'dummyId1',
					username: 'dummyFriend1'
				},
				{
					$id: 'dummyId2',
					username: 'dummyFriend2'
				}
			]
			const DUMMY_DATABASE_DOCUMENT = {
				username: suite.DUMMY_USERNAME,
				friends: DUMMY_FRIENDS_ARRAY
			}

			const queryResultMock = {
				exec: sinon.stub().resolves(DUMMY_DATABASE_DOCUMENT)
			}

			suite.userModelMock.findOne.returns(queryResultMock)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				connection.on(CLIENT_EVENTS.FRIENDS_LIST, data => {
					return suite.friendsInstance.friendsList(data, connection)
						.then(() => {

							//then
							sinon.assert.calledWith(suite.emitSpy, CLIENT_EVENTS.FRIENDS_LIST, DUMMY_FRIENDS_ARRAY)
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