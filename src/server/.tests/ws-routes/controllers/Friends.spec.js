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

	describe('#Notifications', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOneAndUpdate: sinon.stub()
			}

			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
		})

		describe('#RemoveNotifications', () => {

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

		describe('#addNotification', () => {
			it('should add notification to pendingNotifications array in user document', () => {
				//given
				const SENDING_NOTIFICATION_USERNAME = suite.DUMMY_USERNAME
				const RECIEVING_NOTIFICATION_USERNAME = 'DUMMY USERNAME 2'
				const NOTIFICATION_TYPE = CLIENT_EVENTS.INVITE

				const queryResultMock = {
					exec: sinon.stub().resolves()
				}
				suite.userModelMock.findOneAndUpdate.returns(queryResultMock)
	

				//when
				suite.friendsInstance.addNotification(SENDING_NOTIFICATION_USERNAME, RECIEVING_NOTIFICATION_USERNAME, NOTIFICATION_TYPE)
			
				//then
				const expectedSearchingCriteria = {username: RECIEVING_NOTIFICATION_USERNAME}
				const expectedQuery = {
					$push: {
						pendingNotifications : {
							username: SENDING_NOTIFICATION_USERNAME,
							notificationType: NOTIFICATION_TYPE
						}
					}
				}

				sinon.assert.calledWith(suite.userModelMock.findOneAndUpdate.firstCall, expectedSearchingCriteria, expectedQuery)
			})
		})

		describe('#PendingNotifications', () => {
			beforeEach(() => {
				suite.userModelMock.findOne = sinon.stub()
			})

			it('should call emit with pending notifications event type and attached array with notifications to response', done => {
				//given
				const QUERY_FEEDBACK_MOCK = {
					username: suite.DUMMY_USERNAME,
					pendingNotifications: [
						{
							username: 'DUMMY_USERNAME_2',
							notificationType: CLIENT_EVENTS.INVITE
						},
						{
							username: 'DUMMY_USERNAME_3',
							notificationType: CLIENT_EVENTS.CONFIRM_INVITATION
						}
					]
				}
				const queryResultMock = {exec: sinon.stub().resolves(QUERY_FEEDBACK_MOCK)}
				suite.userModelMock.findOne.returns(queryResultMock)

				suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
					socket.on(CLIENT_EVENTS.PENDING_NOTIFICATIONS, data => {
						suite.emitSpy = sinon.spy(socket, 'emit')
						return suite.friendsInstance.pendingNotifications(data, socket)
							.then(() => {
								//then
								const expectedAttachment = QUERY_FEEDBACK_MOCK.pendingNotifications
								sinon.assert.calledWith(suite.emitSpy.firstCall, CLIENT_EVENTS.PENDING_NOTIFICATIONS, expectedAttachment)
								done()
							})
					})
				})

				//when
				suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
				suite.client.emit(CLIENT_EVENTS.PENDING_NOTIFICATIONS)
			})
		})

		describe('#removeNotificationsFromList', () => {
			it('should remove notification from db', () => {
				//given
				suite.userModelMock.findOneAndUpdate.returns({
					exec: sinon.stub()
				})
				const requestingUsername = suite.DUMMY_USERNAME
				const NOTIFICATION_ID_LIST =  [
					{
						_id: 'dummyId1'
					},
					{
						_id: 'dummyId2'
					}
				]

				//when
				suite.friendsInstance.removeNotificationsfromList(NOTIFICATION_ID_LIST, requestingUsername)

				//then
				const expectedSearchingCirteria = {username: suite.DUMMY_USERNAME}
				const expectedQuery = {
					$pull: {
						pendingNotifications: {
							$or: NOTIFICATION_ID_LIST
						}
					}
				}

				sinon.assert.calledWith(suite.userModelMock.findOneAndUpdate.firstCall, expectedSearchingCirteria, expectedQuery)
			})
		})
	})

	describe('#Invite', () => {
		beforeEach(() => {
			suite.DUMMY_INVITATED_USERNAME = 'DUMMY_USERNAME_2'
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
			suite.addNotificationStub = sinon.stub(suite.friendsInstance, 'addNotification').resolves()
		})
		it('should save notification with invitation in pendingNotificaiton array in invitated user document ', done => {
			//given
			const REQUEST_MOCK = {username: suite.DUMMY_INVITATED_USERNAME}
			
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
				sinon.assert.calledWith(suite.addNotificationStub.firstCall, expectedInvitatingUsername, expectedInvitatedUsername, expectedEventType)
				done()
			}
		})
		
		it('should send message to invited user with invite event type and attached payload with invitating username', done => {
			//given
			const REQUEST_MOCK = {username: suite.DUMMY_INVITATED_USERNAME}
			suite.sendMessageToSpecyficUserSpy = sinon.spy(suite.friendsInstance, 'sendMessageToSepcificUser')
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITE, data => {
					suite.friendsInstance.invite(data, socket, suite.connectionsMock)
						.then(() => {
							const epxectedReciveingUsername = suite.DUMMY_INVITATED_USERNAME
							const expectedEventType = CLIENT_EVENTS.INVITE
							const expectedPayload = {username: suite.DUMMY_USERNAME}
							sinon.assert.calledWith(suite.sendMessageToSpecyficUserSpy, socket, suite.connectionsMock, epxectedReciveingUsername, expectedEventType, expectedPayload)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITE, REQUEST_MOCK)

		})
	})

	describe('#InvitationConfirmation', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOne: sinon.stub()
			}

			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
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
				exec: sinon.stub().resolves(suite.QUERY_FEEDBACK_MOCK)
			}
		})

		it('should find requesting user in database and check in pending Notifications existing of invitation', done => {
			//given  
			suite.userModelMock.findOne.returns(suite.queryResultMock)
			suite.addFriendsStub = sinon.stub(suite.friendsInstance, 'addFriends').resolves()
			suite.friendsInstance.addNotification = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket)
						.then(() => {
							//then
							sinon.assert.calledOnce(suite.addFriendsStub)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)
		})

		it('should add friends when invitation exists in database', done => {
			//given
			suite.userModelMock.findOne.returns(suite.queryResultMock)
			suite.addFriendsStub = sinon.stub(suite.friendsInstance, 'addFriends').resolves()
			suite.friendsInstance.addNotification = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket)
						.then(() => {
							//then
							const expectedInvitatingUsername = suite.DUMMY_INVITATING_USERNAME
							const expectedInvitatedUsername = suite.DUMMY_USERNAME
							sinon.assert.calledWith(suite.addFriendsStub, expectedInvitatingUsername, expectedInvitatedUsername)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)

		})

		it('should add notification to pendingNotifications array with "invitation confirmation" event type in user document who sent invitation', done => {
			//given
			suite.userModelMock.findOne.returns(suite.queryResultMock)
			suite.addNotificationStub = sinon.stub(suite.friendsInstance, 'addNotification').resolves()
			suite.friendsInstance.addFriends = sinon.stub()
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				socket.on(CLIENT_EVENTS.INVITATION_CONFIRMATION, data => {
					return suite.friendsInstance.invitaitonConfirmation(data, socket)
						.then(() => {
							//then
							const expectedInvitatingUsername = suite.DUMMY_INVITATING_USERNAME
							const expectedInvitatedUsername = suite.DUMMY_USERNAME
							const expectedNotificationType = CLIENT_EVENTS.INVITATION_CONFIRMATION
							sinon.assert.calledWith(suite.addNotificationStub, expectedInvitatedUsername, expectedInvitatingUsername, expectedNotificationType)
							done()
						})
				})
			})

			//when
			suite.client = socketClient.connect(SERVER_URL, SOCKET_OPTIONS)
			suite.client.emit(CLIENT_EVENTS.INVITATION_CONFIRMATION, suite.REQUEST_MOCK)


		})
	})

	describe('#sendMessageToSpecyficUser', () => {
		beforeEach(() => {
			suite.DUMMY_EVENT_TYPE = 'DUMMY_EVENT_TYPE'
			suite.DUMMY_PAYLOAD = 'DUMMY_PAYLOAD'
			suite.RECIEVING_DUMMY_USERNAME = 'DUMMY_USERNAME_2'
			suite.RECIEVING_SOCKET_ID = 'recievingSocketId'
		})
		
		it('should call to with recievingUserSocket as argument', () => {
			//given
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
			suite.recievingSocketMock = {
				id: suite.RECIEVING_SOCKET_ID
			}

			suite.sendingSocketMock = {
				to: sinon.stub().returns({
					emit: sinon.stub()
				})
			}
			suite.connectionsMock.usersToConnectionsMap.set(suite.RECIEVING_DUMMY_USERNAME, suite.recievingSocketMock)

			//when
			suite.friendsInstance.sendMessageToSepcificUser(suite.sendingSocketMock, suite.connectionsMock, suite.RECIEVING_DUMMY_USERNAME, suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD)

			//then
			assert.isTrue(suite.sendingSocketMock.to.calledWith(suite.RECIEVING_SOCKET_ID))
		})

		it('should call emit with expected event type and payload attatched to message', () => {
			//given
			suite.friendsInstance = new FriendsProvider({
				UserModel: suite.userModelMock
			})
			suite.recievingSocketMock = {
				id: suite.RECIEVING_SOCKET_ID
			}

			suite.sendingSocketMock = {
				to: sinon.stub().returns({
					emit: sinon.stub()
				})
			}
					
			
			suite.connectionsMock.usersToConnectionsMap.set(suite.RECIEVING_DUMMY_USERNAME, suite.recievingSocketMock)

			//when
			suite.friendsInstance.sendMessageToSepcificUser(suite.sendingSocketMock, suite.connectionsMock, suite.RECIEVING_DUMMY_USERNAME, suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD)

			//then
			assert.isTrue(suite.sendingSocketMock.to().emit.calledWith(suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD))

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
				.then(() => then())
			
			//then
			function then() {
				assert.isTrue(saveStub.calledTwice)
				done()
			}

		})
	})
	
})