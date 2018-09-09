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
				const hasSocketBeenSaved = suite.connectionsMock.usersToConnectionsMap.has(suite.DUMMY_USERNAME)
				assert.isTrue(hasSocketBeenSaved)
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

		it('should send friend list when user requests it', done => {
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
						.then(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.GET_FRIENDS_LIST)

			//then
			function assertions() {
				sinon.assert.calledOnce(suite.emitSpy)
				done()
			}
		})

		it('should emit getFriendsList event type with friends list attached to it', done => {
			//given
			const QUERY_FEEDBACK_MOCK = {
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
						.then(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.GET_FRIENDS_LIST)

			//then
			function assertions() {
				const expectedPayload = QUERY_FEEDBACK_MOCK.friends
				sinon.assert.calledWith(suite.emitSpy, CLIENT_EVENTS.GET_FRIENDS_LIST, expectedPayload)
				done()
			}
		})
	})

	describe('#Invite', () => {
		beforeEach(() => {
			suite.DUMMY_INVITED_USERNAME = 'DUMMY_USERNAME_2'
			suite.utilsMock = {
				addNotification : sinon.stub(),
				emitEventToUser: sinon.stub()
			}
			suite.notificationModelMock = {}
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock,
				NotificationModel: suite.notificationModelMock,
				utils: suite.utilsMock
			})
			suite.friendsInstance.isNotFriend = sinon.stub().resolves()
		})
		it('should call addNotification from Notifications class to push invite notification to Notifications array', done => {
			//given
			const REQUEST_MOCK = {username: suite.DUMMY_INVITED_USERNAME}
			suite.utilsMock.addNotification.resolves()
			
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITE, data => {
					suite.friendsInstance.invite(data, socket, suite.connectionsMock)
						.then(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITE, REQUEST_MOCK)

			//then
			function assertions() {
				const expectedInvitingUsername = suite.DUMMY_USERNAME
				const expectedInvitedUsername = suite.DUMMY_INVITED_USERNAME
				const expectedEventType = CLIENT_EVENTS.INVITE
				sinon.assert.calledWith(
					suite.utilsMock.addNotification.firstCall, 
					expectedInvitingUsername, 
					expectedInvitedUsername, 
					expectedEventType)
				done()
			}
		})
		
		it('should send message to invited user with invite event type and attached payload with inviting username', done => {
			//given
			const DUMMY_INVITATION_NOTIFICATION = {
				_id: 0,
				username: suite.DUMMY_USERNAME,
				notificationType: CLIENT_EVENTS.INVITE

			}
			const REQUEST_MOCK = {username: suite.DUMMY_INVITED_USERNAME}
			suite.utilsMock.addNotification.resolves(DUMMY_INVITATION_NOTIFICATION)
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITE, data => {
					suite.friendsInstance.invite(data, socket, suite.connectionsMock)
						.then(() => assertions(socket))
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITE, REQUEST_MOCK)

			//then
			function assertions(socket) {
				const expectedReceivingUsername = suite.DUMMY_INVITED_USERNAME
				const expectedEventType = CLIENT_EVENTS.INVITE
				const expectedPayload = DUMMY_INVITATION_NOTIFICATION
				sinon.assert.calledWith(
					suite.utilsMock.emitEventToUser, 
					socket, suite.connectionsMock, 
					expectedReceivingUsername, 
					expectedEventType, 
					expectedPayload)
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
				emitEventToUser: sinon.stub(),
				addNotification: sinon.stub()
			}

			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock,
				NotificationModel: suite.notificationModelMock,
				utils: suite.utilsMock
			})
			suite.DUMMY_INVITING_USERNAME = 'DUMMY_INVITING_USERNAME'
			suite.REQUEST_MOCK = {username: suite.DUMMY_INVITING_USERNAME}
			suite.QUERY_FEEDBACK_MOCK = {
				username: suite.DUMMY_USERNAME,
				notifications: [
					{
						username: suite.DUMMY_INVITING_USERNAME,
						notificationType: CLIENT_EVENTS.INVITE,
						_id: 'someDummyId'
					}
				]
			}
			suite.queryResultMock = {
				exec: sinon.stub().resolves([suite.QUERY_FEEDBACK_MOCK])
			}
		})

		it('should send query to db for checking if invitation exists in notification array', done => {
			//given  
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.addFriendStub = sinon.stub(suite.friendsInstance, 'addFriend').resolves()
			suite.friendsInstance.addNotification = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitationConfirmation(data, socket, suite.connectionsMock)
						.then(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)
		
			//then
			function assertions() {
				sinon.assert.calledOnce(suite.addFriendStub)
				done()
			}
		})

		it ('should emit "invitation not exists" to user when user invitation not exist in database', done => {
			//given
			suite.QUERY_FEEDBACK_WITHOUT_NOTIFICATIONS_MOCK = {
				username: suite.DUMMY_USERNAME,
				notifications: []
			}
			suite.queryResultWithoutNotificationMock = {
				exec: sinon.stub().resolves([suite.QUERY_FEEDBACK_WITHOUT_NOTIFICATIONS_MOCK])
			}
			suite.userModelMock.find.returns(suite.queryResultWithoutNotificationMock)
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.emitSpy = sinon.spy(socket, 'emit')
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitationConfirmation(data, socket, suite.connectionsMock)
						.catch(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function assertions() {
				const expectedMessage = 'Invitation not Exists'
				sinon.assert.calledWith(suite.emitSpy, CLIENT_EVENTS.INVITATION_CONFIRMATION, expectedMessage)
				done()
			}
		})

		it('should add friends when invitation exists in database', done => {
			//given
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.addFriendStub = sinon.stub(suite.friendsInstance, 'addFriend').resolves()
			suite.friendsInstance.addNotification = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitationConfirmation(data, socket, suite.connectionsMock)
						.then(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function assertions() {
				const expectedInvitingUsername = suite.DUMMY_INVITING_USERNAME
				const expectedInvitedUsername = suite.DUMMY_USERNAME
				sinon.assert.calledWith(suite.addFriendStub, expectedInvitingUsername, expectedInvitedUsername)
				done()
			}
		})

		it('should call emitEventToUser and send confirmation message to inviting user', done => {
			//given
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.friendsInstance.addFriend = sinon.stub().resolves()
			suite.utilsMock.addNotification.resolves()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitationConfirmation(data, socket, suite.connectionsMock)
						.then(() => assertions(socket))
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function assertions(socket) {
				const expectedEventType = CLIENT_EVENTS.INVITATION_CONFIRMATION
				const expectedReceivingUsername = suite.DUMMY_INVITING_USERNAME
				const expectedPayload = {username: suite.DUMMY_USERNAME}
				sinon.assert.calledWith(
					suite.utilsMock.emitEventToUser, 
					socket, 
					suite.connectionsMock, 
					expectedReceivingUsername, 
					expectedEventType, 
					expectedPayload)
				done()
			}
		})

		it('should call addNotification from Notifications class to add new notification to notifications when receiving user is not connected to namespace', done => {
			//given
			suite.utilsMock.addNotification.resolves()
			suite.userModelMock.find.returns(suite.queryResultMock)
			suite.friendsInstance.addFriend = sinon.stub().resolves()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitationConfirmation(data, socket, suite.connectionsMock)
						.then(assertions)
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

			//then
			function assertions() {
				const expectedInvitingUsername = suite.DUMMY_INVITING_USERNAME
				const expectedInvitedUsername = suite.DUMMY_USERNAME
				const expectedNotificationType = CLIENT_EVENTS.INVITATION_CONFIRMATION
				sinon.assert.calledWith(
					suite.utilsMock.addNotification, 
					expectedInvitedUsername, 
					expectedInvitingUsername, 
					expectedNotificationType)
				done()
			}
		})
	})

	describe('#isNotFriend', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOne: sinon.stub()
			}
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
		})

		it('should reject promise when inviting username is on invited username friends list', done => {
			//given
			const INVITING_USERNAME = suite.DUMMY_USERNAME
			const INVITED_USERNAME = 'INVITED_USERNAME'

			const QUERY_FEEDBACK_MOCK = {
				friends: [
					{
						username: INVITING_USERNAME
					}
				]
			}

			suite.queryResult = {
				exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)
			}

			suite.userModelMock.findOne.returns(suite.queryResult)

			//when
			suite.friendsInstance.isNotFriend(INVITING_USERNAME, INVITED_USERNAME)
				//then
				.catch(done)

		})
	})

	describe('#addFriend', () => {
		it('should push friend username to friends array', done => {
			//given
			const DUMMY_USERNAME_2 = 'DUMMY_USERNAME_2'
			const saveStub = sinon.stub()
			suite.collectionMock = [
				{
					save: saveStub,
					username: suite.DUMMY_USERNAME,
					friends: []
				},
				{
					save: saveStub,
					username: DUMMY_USERNAME_2,
					friends: []
				},
			]
			suite.userModelMock = {
				find: sinon.stub()
			}
			const queryResultMock = {
				exec: sinon.stub().resolves(suite.collectionMock)
			}
			suite.userModelMock.find.returns(queryResultMock)
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})

			//when
			const invitingUsername = suite.DUMMY_USERNAME
			const invitedUsername = DUMMY_USERNAME_2
			suite.friendsInstance.addFriend(invitingUsername, invitedUsername)
				.then(assertions)
				
			//then
			function assertions() {
				const expectedUserDocuments = [
					{
						save: saveStub,
						username: suite.DUMMY_USERNAME,
						friends: [
							{
								username: DUMMY_USERNAME_2
							}
						]
					},
					{
						save: saveStub,
						username: DUMMY_USERNAME_2,
						friends: [
							{
								username: suite.DUMMY_USERNAME
							}
						]
					},
				]
				assert.deepEqual(suite.collectionMock, expectedUserDocuments)
				done()
			}

		})

		it('should call save to mongo db', done => {
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
			const invitingUsername = suite.DUMMY_USERNAME
			const invitedUsername = DUMMY_USERNAME_2
			suite.friendsInstance.addFriend(invitingUsername, invitedUsername)
				.then(assertions)
			
			//then
			function assertions() {
				assert.isTrue(saveStub.calledTwice)
				done()
			}
		})
	})	
})