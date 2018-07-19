const sinon = require('sinon')
const namespaceInfo = require('../../../protocol/protocol.json').notifications
const NotificationsProvider = require('../../../ws-routes/controllers/Notifications')
const CLIENT_EVENTS = namespaceInfo.eventTypes

let suite = {}
describe('Notifications websocket namespace', () => {
	beforeEach(() => {
		suite = {}
		suite.DUMMY_USERNAME = 'DUMMY_USERNAME'
		suite.userModelMock = {
			findOneAndUpdate: sinon.stub(),
			find: sinon.stub()
		}

		suite.utilsMock = {
			removeNotifications: sinon.stub()
		}
		suite.notificationsInstance = new NotificationsProvider({
			UserModel: suite.userModelMock,
			utils: suite.utilsMock
		})
		suite.socketMock = {
			emit: sinon.spy()
		}
		suite.socketMock.request = {
			user: {username: suite.DUMMY_USERNAME}
		}
	})

	describe('#RemoveNotifications', () => {

		it('should call emit with remove notifications event type when notifications was removed', done => {
			//given
			const DUMMY_DATA = {
				notificationIds: []
			}
			const queryResultMock = {
				exec: sinon.stub().resolves()
			}
			suite.userModelMock.findOneAndUpdate.returns(queryResultMock)

			//when
			suite.notificationsInstance.removeNotifications(DUMMY_DATA, suite.socketMock)
				.then(asserations)

			//then
			function asserations() {
				sinon.assert.calledWith(suite.socketMock.emit, CLIENT_EVENTS.REMOVE_NOTIFICATIONS)
				done()
			}
		
		})
	
		it('should send query to mongo which removes notification records from db by id ', done => {
			//given
			const DUMMY_ID_1 = 'dummyId1'
			const DUMMY_ID_2 = 'dummyId2'
			const DUMMY_DATA = {
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

			//when
			suite.notificationsInstance.removeNotifications(DUMMY_DATA, suite.socketMock)
				.then(asserations)
			
			//then
			function asserations() {
				const expectedSearchingCriteria = {username: suite.DUMMY_USERNAME}
				const expectedQuery = {
					$pull: {
						pendingNotifications: {
							$or: DUMMY_DATA.notificationIds
						}
					}
				}
				sinon.assert.calledWith(suite.userModelMock.findOneAndUpdate, expectedSearchingCriteria, expectedQuery)
				done()
			}
		})
	})

	describe('#PendingNotifications', () => {

		it('should call emit with pending notifications event type and attached array with notifications to response', done => {
			//given
			const DUMMY_DATA = {}
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
			const queryResultMock = {exec: sinon.stub().resolves([QUERY_FEEDBACK_MOCK])}
			suite.userModelMock.find.returns(queryResultMock)

			//when
			suite.notificationsInstance.getPendingNotifications(DUMMY_DATA, suite.socketMock)
				.then(asserations)
			
			//then
			function asserations() {
				const expectedAttachment = QUERY_FEEDBACK_MOCK.pendingNotifications
				sinon.assert.calledWith(suite.socketMock.emit.firstCall, CLIENT_EVENTS.GET_PENDING_NOTIFICATIONS, expectedAttachment)
				done()
			}
		})
	})
})