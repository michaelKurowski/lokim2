const FriendsProvider = require('../../../ws-routes/controllers/Friends')
const namespaceInfo = require('../../../protocol/protocol.json').friends
const config = require('../../../config.json')
const socketClient = require('socket.io-client')
const io = require('socket.io')
const _ = require('lodash')
const sinon = require('sinon')
const assert = require('chai').assert

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

	describe('#Connection', () => {
		beforeEach(() => {
			suite.connectionsMock = {
				usersToConnectionsMap: new Map()
			} 

			suite.friendsInstance = new FriendsProvider({
				UserModel: sinon.stub()
			})
		})

		it('should add new element to user-socket map', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.friendsInstance.connection(socket, suite.connectionsMock)
				then()
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)

			//then
			function then() {
				const hasSocketStored = suite.connectionsMock.usersToConnectionsMap.has(suite.DUMMY_USERNAME)
				assert.isTrue(hasSocketStored)
				done()
			}
		})

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

	describe('#RemoveNotifications', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOneAndUpdate: sinon.stub()
			}

			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
		})

		it('should call emit with remove notifications event type when notifications was removed', done => {
			//given
			const DUMMY_REQUEST = []
			const queryResultMock = {
				exec: sinon.stub().resolves()
			}
			suite.userModelMock.findOneAndUpdate.returns(queryResultMock)

			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.REMOVE_NOTIFICATIONS, data => {
					suite.emitSpy = sinon.spy(socket, 'emit')
					suite.friendsInstance.removeNotifications(data, socket)
						.then(() => {
							//then
							sinon.assert.calledWith(suite.emitSpy.firstCall, CLIENT_EVENTS.REMOVE_NOTIFICATIONS)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.REMOVE_NOTIFICATIONS, DUMMY_REQUEST)
		})
	

		it('should remove notification records from db by id ', done => {
			//given
			const DUMMY_ID_1 = 'dummyId1'
			const DUMMY_ID_2 = 'dummyId2'
			const REQUEST_MOCK = {
				notificationIds : [
					{
						_id: DUMMY_ID_1
					},
					{
						_id: DUMMY_ID_2
					}
				]
			}

			const queryResultMock = {
				exec: sinon.stub().resolves()
			}
			suite.userModelMock.findOneAndUpdate.returns(queryResultMock)


			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.REMOVE_NOTIFICATIONS, data => {
					suite.friendsInstance.removeNotifications(data, socket)
					then()
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.REMOVE_NOTIFICATIONS, REQUEST_MOCK)
		
			//then
			function then() {
				const expectedSearchingCriteria = {username: suite.DUMMY_USERNAME}
				const expectedQuery = {
					$pull: {
						pendingNotifications: {
							$or: REQUEST_MOCK.notificationIds
						}
					}
				}
				
				sinon.assert.calledWith(suite.userModelMock.findOneAndUpdate, expectedSearchingCriteria, expectedQuery)
				done()
			}
		})


	})
})