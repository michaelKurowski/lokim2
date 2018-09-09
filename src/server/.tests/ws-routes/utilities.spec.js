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
			const DUMMY_RECEIVING_NOTIFICATION_USERNAME = 'DUMMY_USERNAME_RECEIVING'
			const DUMMY_NOTIFICATION_TYPE = 'DUMMY_NOTIFICATION_TYPE'

			//when
			utilities.addNotification( 
				DUMMY_SENDING_NOTIFICATION_USERNAME, 
				DUMMY_RECEIVING_NOTIFICATION_USERNAME, 
				DUMMY_NOTIFICATION_TYPE,
				notificationModel, 
				suite.userModelMock)
				.then(assertions)
			
			//then
			function assertions(createdNotification) {
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
			const DUMMY_RECEIVING_NOTIFICATION_USERNAME = 'DUMMY_USERNAME_RECEIVING'
			const DUMMY_NOTIFICATION_TYPE = 'DUMMY_NOTIFICATION_TYPE'

			//when
			utilities.addNotification( 
				DUMMY_SENDING_NOTIFICATION_USERNAME, 
				DUMMY_RECEIVING_NOTIFICATION_USERNAME, 
				DUMMY_NOTIFICATION_TYPE,
				notificationModel, 
				suite.userModelMock)
				
				.then(assertions)
			
			//then
			function assertions() {
				sinon.assert.calledOnce(suite.QUERY_FEEDBACK_MOCK.save)
				done()
			}
		})
	})

	describe('#emitEventToUser', () => {
		beforeEach(() => {
			suite.RECEIVING_SOCKET_ID = 'receivingSocketId'
			suite.connectionsMock = {
				usersToConnectionsMap: new Map()
			}

			suite.receivingSocketMock = {
				id: suite.RECEIVING_SOCKET_ID
			}
		})

		it('should call socket.io with receivingUserSocket as argument', () => {
			//given
			suite.DUMMY_EVENT_TYPE = 'DUMMY_EVENT_TYPE'
			suite.DUMMY_PAYLOAD = 'DUMMY_PAYLOAD'
			suite.RECEIVING_DUMMY_USERNAME = 'DUMMY_USERNAME_2'

			suite.connectionsMock.usersToConnectionsMap.set(
				suite.RECEIVING_DUMMY_USERNAME, 
				suite.receivingSocketMock)

			suite.sendingSocketMock = {
				to: sinon.stub().returns({
					emit: sinon.stub()
				})
			}

			//when
			utilities.emitEventToUser(
				suite.sendingSocketMock, 
				suite.connectionsMock, 
				suite.RECEIVING_DUMMY_USERNAME, 
				suite.DUMMY_EVENT_TYPE, 
				suite.DUMMY_PAYLOAD)

			//then
			assert.isTrue(suite.sendingSocketMock.to.calledWith(suite.RECEIVING_SOCKET_ID))
		})

		it('should call emit with expected event type and payload attached to message', () => {
			//given
			suite.DUMMY_EVENT_TYPE = 'DUMMY_EVENT_TYPE'
			suite.DUMMY_PAYLOAD = 'DUMMY_PAYLOAD'
			suite.RECEIVING_DUMMY_USERNAME = 'DUMMY_USERNAME_2'
			
			suite.connectionsMock.usersToConnectionsMap.set(suite.RECEIVING_DUMMY_USERNAME, suite.receivingSocketMock)

			suite.sendingSocketMock = {
				to: sinon.stub().returns({
					emit: sinon.stub()
				})
			}

			//when
			utilities.emitEventToUser(
				suite.sendingSocketMock, 
				suite.connectionsMock, 
				suite.RECEIVING_DUMMY_USERNAME, 
				suite.DUMMY_EVENT_TYPE, 
				suite.DUMMY_PAYLOAD)

			//then
			assert.isTrue(suite.sendingSocketMock.to().emit.calledWith(suite.DUMMY_EVENT_TYPE, suite.DUMMY_PAYLOAD))

		})
	})

})
