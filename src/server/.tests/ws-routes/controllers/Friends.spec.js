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
		
		suite.connectionsMock = {
			usersToConnectionsMap: new Map()
		} 
		suite.client = {}
		suite.userModelMock = {}
		suite.namespaceUtils = {
			notification: sinon.stub()
		}

	})

	afterEach(done => {
		suite.server.close(done)
		if(_.isFunction(suite.client.disconnect)) suite.client.disconnect()
	})

	describe('#Connection', () => {
		beforeEach(() => {
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
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
				find: sinon.stub()
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
			suite.userModelMock.find.returns(queryResultMock)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				connection.on(CLIENT_EVENTS.GET_FRIENDS_LIST, data => {
					suite.emitSpy = sinon.spy(connection, 'emit')
					return suite.friendsInstance.getFriendsList(data, connection)
						.then(asserations)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.GET_FRIENDS_LIST)

			//then
			function asserations() {
				sinon.assert.calledOnce(suite.emitSpy)
				done()
			}
		})

		it('should emit getFriendsList event type with friends list attached to it', done => {
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

			suite.userModelMock.find.returns(queryResultMock)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				connection.on(CLIENT_EVENTS.GET_FRIENDS_LIST, data => {
					return suite.friendsInstance.getFriendsList(data, connection)
						.then(asserations)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.GET_FRIENDS_LIST)

			//then
			function asserations() {
				const expectedPayload = QUERY_FEEDBACK_MOCK.friends
				sinon.assert.calledWith(suite.emitSpy, CLIENT_EVENTS.GET_FRIENDS_LIST, expectedPayload)
				done()
			}
		})
	})

	describe('#Invite', () => {
		beforeEach(() => {
			suite.DUMMY_INVITATED_USERNAME = 'DUMMY_USERNAME_2'
			suite.utilsMock = {
				addNotification : sinon.stub(),
				sendMessageToSepcificUser: sinon.stub()
			}
			suite.notificationModelMock = {}
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock,
				NotificationModel: suite.notificationModelMock,
				utils: suite.utilsMock
			})
		})
		it('should call addNotification from Notifications class to push invite notification to pending Notifications array', done => {
			//given
			const REQUEST_MOCK = {username: suite.DUMMY_INVITATED_USERNAME}
			suite.utilsMock.addNotification.resolves()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITE, data => {
					suite.friendsInstance.invite(data, socket, suite.connectionsMock)
					then()
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITE, REQUEST_MOCK)

			//then
			function then() {
				const expectedInvitatingUsername = suite.DUMMY_USERNAME
				const expectedInvitatedUsername = suite.DUMMY_INVITATED_USERNAME
				const expectedEventType = CLIENT_EVENTS.INVITE
				sinon.assert.calledWith(suite.utilsMock.addNotification.firstCall, 
					suite.notificationModelMock, suite.userModelMock, expectedInvitatingUsername, expectedInvitatedUsername, expectedEventType)
				done()
			}
		})
		
		it('should send message to invited user with invite event type and attached payload with invitating username', done => {
			//given
			const DUMMY_NOTIFICATION = {
				_id: 0,
				username: suite.DUMMY_USERNAME,
				notificationType: CLIENT_EVENTS.INVITE

			}
			const REQUEST_MOCK = {username: suite.DUMMY_INVITATED_USERNAME}
			suite.utilsMock.addNotification.resolves(DUMMY_NOTIFICATION)
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITE, data => {
					suite.friendsInstance.invite(data, socket, suite.connectionsMock)
						.then(() => asserations(socket))
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITE, REQUEST_MOCK)

			//then
			function asserations(socket) {
				const epxectedReciveingUsername = suite.DUMMY_INVITATED_USERNAME
				const expectedEventType = CLIENT_EVENTS.INVITE
				const expectedPayload = DUMMY_NOTIFICATION
				sinon.assert.calledWith(suite.utilsMock.sendMessageToSepcificUser, socket, suite.connectionsMock, epxectedReciveingUsername, expectedEventType, expectedPayload)
				done()
			}

		})
	})

	describe('#InvitationConfirmation', () => {
		beforeEach(() => {
			suite.userModelMock = {
				find: sinon.stub()
			}
			suite.notificationModelMock = {}
			suite.utilsMock = {
				sendMessageToSepcificUser: sinon.stub(),
				addNotification: sinon.stub()
			}

			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock,
				NotificationModel: suite.notificationModelMock,
				utils: suite.utilsMock
			})
			suite.DUMMY_INVITATING_USERNAME = 'DUMMY_INVITATING_USERNAME'
			suite.REQUEST_MOCK = {username: suite.DUMMY_INVITATING_USERNAME}
			suite.QUERY_FEEDBACK_MOCK = {
				username: suite.DUMMY_USERNAME,
				pendingNotifications: [
					{
						username: suite.DUMMY_INVITATING_USERNAME,
						notificationType: CLIENT_EVENTS.INVITE,
						_id: 'someDummyId'
					}
				]
			}
			suite.queryResultMock = {
				exec: sinon.stub().resolves([suite.QUERY_FEEDBACK_MOCK])
			}
		})

		it('should send query to db for checking if invitation exsists in pendingNotification array', done => {
			//given  
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.addFriendsStub = sinon.stub(suite.friendsInstance, 'addFriends').resolves()
			suite.friendsInstance.addNotification = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket, suite.connectionsMock)
						.then(asserations)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)
		
			//then
			function asserations() {
				sinon.assert.calledOnce(suite.addFriendsStub)
				done()
			}
		})

		it('should add friends when invitation exists in database', done => {
			//given
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.addFriendsStub = sinon.stub(suite.friendsInstance, 'addFriends').resolves()
			suite.friendsInstance.addNotification = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket, suite.connectionsMock)
						.then(asserations)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function asserations() {
				const expectedInvitatingUsername = suite.DUMMY_INVITATING_USERNAME
				const expectedInvitatedUsername = suite.DUMMY_USERNAME
				sinon.assert.calledWith(suite.addFriendsStub, expectedInvitatingUsername, expectedInvitatedUsername)
				done()
			}
		})

		it('should call sendMessageToSpecificUser and send confirmation message to invitataing user', done => {
			//given
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.friendsInstance.addFriends = sinon.stub().resolves()
			suite.utilsMock.addNotification.resolves()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket, suite.connectionsMock)
						.then(() => asserations(socket))
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function asserations(socket) {
				const expectedEventType = CLIENT_EVENTS.INVITATION_CONFIRMATION
				const expectedRecievingUsername = suite.DUMMY_INVITATING_USERNAME
				const expectedPayload = {username: suite.DUMMY_USERNAME}
				sinon.assert.calledWith(suite.utilsMock.sendMessageToSepcificUser, socket, suite.connectionsMock, expectedRecievingUsername, expectedEventType, expectedPayload)
				done()
			}
		})

		it('should call addNotification from Notifications class to add new notification to pendingNotifications when recieving user is not connected to namespace', done => {
			//given
			suite.utilsMock.addNotification.resolves()
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.friendsInstance.addFriends = sinon.stub().resolves()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket, suite.connectionsMock)
						.then(asserations)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function asserations() {
				const expectedInvitatingUsername = suite.DUMMY_INVITATING_USERNAME
				const expectedInvitatedUsername = suite.DUMMY_USERNAME
				const expectedNotificationType = CLIENT_EVENTS.INVITATION_CONFIRMATION
				sinon.assert.calledWith(suite.utilsMock.addNotification, suite.notificationModelMock, suite.userModelMock, expectedInvitatedUsername, expectedInvitatingUsername, expectedNotificationType)
				done()
			}
		})
	})

	describe('#addFriends', () => {
		it('should push firend username to firends array', done => {
			//given
			const DUMMY_USERNAME_2 = 'DUMMY_USERNAME_2'
			const COLLECTION_MOCK = [
				{
					save: sinon.stub(),
					username: suite.DUMMY_USERNAME,
					friends: []
				},
				{
					save: sinon.stub(),
					username: DUMMY_USERNAME_2,
					friends: []
				},
			]
			suite.usersCollectionMock = _.cloneDeep(COLLECTION_MOCK)
			suite.userModelMock = {
				find: sinon.stub()
			}
			const queryResultMock = {
				exec: sinon.stub().resolves(suite.usersCollectionMock)
			}
			suite.userModelMock.find.returns(queryResultMock)
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})

			//when
			const invitatingUsername = suite.DUMMY_USERNAME
			const invitatedUSername = DUMMY_USERNAME_2
			suite.friendsInstance.addFriends(invitatingUsername, invitatedUSername)
				.then(() => then())

			//then
			function then() {
				let expectedUserCollectionMock = _.cloneDeep(COLLECTION_MOCK)
				expectedUserCollectionMock[0].friends.push({username: DUMMY_USERNAME_2})
				expectedUserCollectionMock[1].friends.push({username: suite.DUMMY_USERNAME})

				assert.deepEqual(suite.usersCollectionMock, expectedUserCollectionMock)
				done()
			}

		})

		it('should call save to mongo db twice to each users', done => {
			//given
			const DUMMY_USERNAME_2 = 'DUMMY_USERNAME_2'
			suite.userModelMock = {
				find: sinon.stub()
			}
			const saveStub = sinon.stub()
			let QUERY_FEEDBACK_MOCK = [
				{
					username: suite.DUMMY_USERNAME,
					friends: [],
					save: saveStub
				},
				{
					username: DUMMY_USERNAME_2,
					friends: [],
					save: saveStub
				},
			]

			const queryResultMock = {
				exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)
			}
			suite.userModelMock.find.returns(queryResultMock)
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})

			//when
			const invitatingUsername = suite.DUMMY_USERNAME
			const invitatedUSername = DUMMY_USERNAME_2
			suite.friendsInstance.addFriends(invitatingUsername, invitatedUSername)
				.then(asserations)
			
			//then
			function asserations() {
				assert.isTrue(saveStub.calledTwice)
				done()
			}
		})
	})	
})