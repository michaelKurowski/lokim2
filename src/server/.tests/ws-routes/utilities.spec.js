const sinon = require('sinon')
const assert = require('chai').assert
const utilities = require('../../ws-routes/utilities')
const notificationModel = require('../../models/notification')
let suite = {}

describe('#Utilities (ws-routes)', () => {
	beforeEach(() => {
		suite = {}
	})

	describe('#addNotification', () => {
		beforeEach(() => {
			suite.userModelMock = {
				findOne: sinon.stub()
			}

			suite.QUERY_FEEDBACK_MOCK = {
				pendingNotifications: [],
				save: sinon.stub()
			}
			suite.queryResult = {
				exec: sinon.stub().resolves(suite.QUERY_FEEDBACK_MOCK)
			}
		
			suite.userModelMock.findOne.returns(suite.queryResult)
		})

		it('should create new notification entry', done => {
			//given 
			const DUMMY_SENDING_NOTIFICATION_USERNAME = 'DUMMY_USERNAME_SENDING'
			const DUMMY_RECIEVING_NOTIFICATION_USERNAME = 'DUMMY_USERNAME_RECIEVING'
			const DUMMY_NOTIFICATION_TYPE = 'DUMMY_NOTIFICATION_TYPE'

			//when
			utilities.addNotification(notificationModel, suite.userModelMock, DUMMY_SENDING_NOTIFICATION_USERNAME, DUMMY_RECIEVING_NOTIFICATION_USERNAME, DUMMY_NOTIFICATION_TYPE)
				.then(asserations)
			
			//then
			function asserations(createdNotification) {
				const expectedUsername = DUMMY_SENDING_NOTIFICATION_USERNAME
				assert.strictEqual(createdNotification.username, expectedUsername)
				assert.strictEqual(createdNotification.notificationType, DUMMY_NOTIFICATION_TYPE)
				assert.isNotEmpty(createdNotification._id)
				done()
			}
		})

		it('should save notification entry to database', done => {
			//given 
			const DUMMY_SENDING_NOTIFICATION_USERNAME = 'DUMMY_USERNAME_SENDING'
			const DUMMY_RECIEVING_NOTIFICATION_USERNAME = 'DUMMY_USERNAME_RECIEVING'
			const DUMMY_NOTIFICATION_TYPE = 'DUMMY_NOTIFICATION_TYPE'

			//when
			utilities.addNotification(notificationModel, suite.userModelMock, DUMMY_SENDING_NOTIFICATION_USERNAME, DUMMY_RECIEVING_NOTIFICATION_USERNAME, DUMMY_NOTIFICATION_TYPE)
				.then(asserations)
			
			//then
			function asserations() {
				sinon.assert.calledOnce(suite.QUERY_FEEDBACK_MOCK.save)
				done()
			}
		})
	})

	describe('#sendMessageToSpecificUser', () => {
		beforeEach(() => {
			suite.RECIEVING_SOCKET_ID = 'recievingSocketId'
			suite.connectionsMock = {
				usersToConnectionsMap: new Map()
			}

			suite.recievingSocketMock = {
				id: suite.RECIEVING_SOCKET_ID
			}
		})

		it('should call socket.to with recievingUserSocket as argument', () => {
			//given
			suite.DUMMY_EVENT_TYPE = 'DUMMY_EVENT_TYPE'
			suite.DUMMY_PAYLOAD = 'DUMMY_PAYLOAD'
			suite.RECIEVING_DUMMY_USERNAME = 'DUMMY_USERNAME_2'

			suite.connectionsMock.usersToConnectionsMap.set(suite.RECIEVING_DUMMY_USERNAME, suite.recievingSocketMock)

			suite.sendingSocketMock = {
				to: sinon.stub().returns({
					emit: sinon.stub()
				})
			}

			//when
			utilities.sendMessageToSepcificUser(suite.sendingSocketMock, suite.connectionsMock, suite.RECIEVING_DUMMY_USERNAME, suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD)

			//then
			assert.isTrue(suite.sendingSocketMock.to.calledWith(suite.RECIEVING_SOCKET_ID))
		})

		it('should call emit with expected event type and payload attatched to message', () => {
			//given
			suite.DUMMY_EVENT_TYPE = 'DUMMY_EVENT_TYPE'
			suite.DUMMY_PAYLOAD = 'DUMMY_PAYLOAD'
			suite.RECIEVING_DUMMY_USERNAME = 'DUMMY_USERNAME_2'
			
			suite.connectionsMock.usersToConnectionsMap.set(suite.RECIEVING_DUMMY_USERNAME, suite.recievingSocketMock)

			suite.sendingSocketMock = {
				to: sinon.stub().returns({
					emit: sinon.stub()
				})
			}

			//when
			utilities.sendMessageToSepcificUser(suite.sendingSocketMock, suite.connectionsMock, suite.RECIEVING_DUMMY_USERNAME, suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD)

			//then
			assert.isTrue(suite.sendingSocketMock.to().emit.calledWith(suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD))

		})
	})

})
