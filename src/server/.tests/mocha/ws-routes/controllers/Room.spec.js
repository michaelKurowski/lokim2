const assert = require('chai').assert
const _ = require('lodash')
const sinon = require('sinon')
const socketClient = require('socket.io-client')
const io = require('socket.io')
const mockRequire = require('mock-require')
mockRequire.stopAll()
mockModels()

const RoomProvider = require('../../../../ws-routes/controllers/Room')
const config = require('../../../../config.json')
const namespaceInfo = require('../../../../protocol/protocol.json').room


const CLIENT_EVENTS = namespaceInfo.eventTypes
const SOCKET_PORT = config.devPropeties.httpTestPort
const SOCKET_URL = `http://localhost:${SOCKET_PORT}`
const SOCKET_OPTIONS = {
	transports: ['websocket'],
	'force new connection': true
}

let suite

describe('Room websocket namespace', () => {
	beforeEach(() => {
		suite = {}
		suite.connectionsMock = {
			usersToConnectionsMap: new Map()
		}
		suite.server = io.listen(SOCKET_PORT)
		suite.USERNAME_MOCK = 'DUMMY_USERNAME'
		suite.middlewareMock = sinon.stub().callsFake((socket, next) => {
			socket.request.user = {username: suite.USERNAME_MOCK}
			next()
		})
		suite.server.use(suite.middlewareMock)
		suite.client = {}
		suite.roomInstance = new RoomProvider(RoomProvider)

		mockModels()
	})

	afterEach(done => {
		suite.server.close(done)
		if (_.isFunction(suite.client.disconnect)) suite.client.disconnect()
		mockRequire.stopAll()
	})

	describe('#connection', () => {
		it('should new entry be added with its key as user name to connections repository when connected', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.roomInstance.connection(socket, suite.connectionsMock)
					.then(then)
				//then()
			})

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			function then() {
				const hasSessionStored = suite.connectionsMock.usersToConnectionsMap.has(suite.USERNAME_MOCK)
				assert.isTrue(hasSessionStored)
				done()
			}
		})

		it('should add a new entry to connections list which is instance of socket when connecting to Room namespace', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.newSocket = socket
				suite.roomInstance.connection(socket, suite.connectionsMock)
				then()
			})

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//then
			function then() {
				const storedSession = suite.connectionsMock.usersToConnectionsMap.get(suite.USERNAME_MOCK)
				assert.strictEqual(storedSession, suite.newSocket)
				done()
			}
		})
	})

	describe('#disconnect', () => {

		it('should remove username-socket entry from connection repository when client is logged out', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.roomInstance.connection(socket, suite.connectionsMock)
				socket.on(CLIENT_EVENTS.DISCONNECT, () => {
					suite.roomInstance.disconnect(socket, suite.connectionsMock)
					then()
				})
				logoutMock()
				
			})

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
			function logoutMock() {
				const userSocket = suite.connectionsMock.usersToConnectionsMap.get(suite.USERNAME_MOCK)
				userSocket.disconnect(true)
			}
			
			
			//then
			function then() {
				assert.isTrue(suite.connectionsMock.usersToConnectionsMap.size === 0)
				done()
			}
		})

		it('should remove username-socket entry from connection repository when client is disconnected', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.roomInstance.connection(socket, suite.connectionsMock)
				when()
				socket.on(CLIENT_EVENTS.DISCONNECT, () => {
					suite.roomInstance.disconnect(socket, suite.connectionsMock)
					then()
				})
			})

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
			function when() {
				suite.client.disconnect()
			}
			
			
			//then
			function then() {
				assert.isTrue(suite.connectionsMock.usersToConnectionsMap.size === 0)
				done()
			}
		})
	})

	describe('#join', () => {
		it('should send "join" event when receiving "join" request', done => {
			//given
			const requestMock = {
				roomId: 'random room id'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => 
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)
			)
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(CLIENT_EVENTS.JOIN, then)
			function then() {
				done()
			}
		})

		it('should send "message" event width message history when receiving "join" request', done => {
			//given
			const requestMock = {
				roomId: 'random room id'
			}
			
			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => 
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)
			)
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(CLIENT_EVENTS.MESSAGE, then)
			function then() {
				done()
			}
		})

		it('should ignore event when receiving "join" request with empty roomId', done => {
			const MAXIMUM_WAITING_TIME = 1000
			//given
			const requestMock = {
				roomId: ''
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => 
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)
			)
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(CLIENT_EVENTS.JOIN, then)

			setTimeout(done, MAXIMUM_WAITING_TIME)
			function then() {
				done(new Error('Unintended behaviour'))
			}
		})

		it('should call #join on socket in order to join the room when receiving a request', done => {
			//given
			const requestMock = {
				roomId: 'random room id'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.roomJoinSpy = sinon.spy(connection, 'join')
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(CLIENT_EVENTS.JOIN, then)

			function then() {
				sinon.assert.calledOnce(suite.roomJoinSpy)
				done()
			}
		})

		it('should attach number type date property to "join" events sent from server', done => {
			//given
			const requestMock = {
				roomId: 'random room id'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => 
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)
			)
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(CLIENT_EVENTS.JOIN, then)
			function then(data) {
				
				assert.isNumber(data.date)
				done()
			}
		})
	})

	describe('#message', () => {
		it('should emit message event type on socket when receiving a message event from client', done => {
			//given
			const requestMock = {
				roomId: 'random room id',
				message: 'dummy message'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				connection.on(CLIENT_EVENTS.MESSAGE, data => {
					suite.roomInstance.message(data, connection, suite.connectionsMock)
					then()
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.MESSAGE, requestMock)

			//then
			function then() {
				sinon.assert.calledWith(suite.emitSpy.firstCall, CLIENT_EVENTS.MESSAGE)
				done()
			}
		})

		it('should emit message event type to the right room on socket when receiving a message event from client', done => {
			//given
			const ROOM_ID = 'random room id'
			const requestMock = {
				roomId: ROOM_ID,
				message: 'dummy message'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				suite.toSpy = sinon.spy(connection, 'to')
				connection.on(CLIENT_EVENTS.MESSAGE, data => {
					suite.roomInstance.message(data, connection, suite.connectionsMock)
					then()
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.MESSAGE, requestMock)
			
			//then
			function then() {
				sinon.assert.calledWith(suite.toSpy.firstCall, ROOM_ID)
				sinon.assert.calledWith(suite.emitSpy.firstCall, CLIENT_EVENTS.MESSAGE)
				done()
			}
		})

		it('should emit message event type wth numerical date attached to it', done => {
			//given
			const requestMock = {
				roomId: 'random room id',
				message: 'dummy message'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				connection.on(CLIENT_EVENTS.MESSAGE, data => {
					suite.roomInstance.message(data, connection, suite.connectionsMock)
					then()
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.MESSAGE, requestMock)

			//then
			function then() {

				const expectedData = {
					date: sinon.match.number
				}
				sinon.assert.calledWithMatch(suite.emitSpy.firstCall, CLIENT_EVENTS.MESSAGE, expectedData)
				done()
			}
		})
	})

	describe('#leave', () => {
		it('should leave room', done => {
			//given
			const ROOM_ID = 'random room id'
			const requestMock = {
				roomId: ROOM_ID
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.leaveSpy = sinon.spy(connection, 'leave')
				connection.on(CLIENT_EVENTS.MESSAGE, data => {
					suite.roomInstance.leave(data, connection, suite.connectionsMock)
					then()
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.MESSAGE, requestMock)

			//then
			function then() {
				const expectedEventData = {roomId: ROOM_ID}
				sinon.assert.calledWith(suite.leaveSpy.firstCall, expectedEventData)
				done()
			}
		})

		it('should emit "leave" event with username of the person who left to the left room', done => {
			//given
			const ROOM_ID = 'random room id'
			const requestMock = {
				roomId: ROOM_ID
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				suite.toSpy = sinon.spy(connection, 'to')
				connection.on(CLIENT_EVENTS.LEAVE, data => {
					suite.roomInstance.leave(data, connection, suite.connectionsMock)
					then()
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.LEAVE, requestMock)

			//then
			function then() {
				const expectedEventMessage = {
					payload: {
						username: suite.USERNAME_MOCK
					}
				}
				sinon.assert.calledWith(suite.toSpy.firstCall, ROOM_ID)
				sinon.assert.calledWithMatch(suite.emitSpy.firstCall, CLIENT_EVENTS.LEAVE, expectedEventMessage)

				done()
			}
		})

		it('should emit "leave" event with numerical timestamp', done => {
			//given
			const ROOM_ID = 'random room id'
			const requestMock = {
				roomId: ROOM_ID
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				suite.toSpy = sinon.spy(connection, 'to')
				connection.on(CLIENT_EVENTS.LEAVE, data => {
					suite.roomInstance.leave(data, connection, suite.connectionsMock)
					then()
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.LEAVE, requestMock)

			//then
			function then() {
				const expectedEventMessage = {
					date: sinon.match.number
				}
				sinon.assert.calledWith(suite.toSpy.firstCall, ROOM_ID)
				sinon.assert.calledWithMatch(suite.emitSpy.firstCall, CLIENT_EVENTS.LEAVE, expectedEventMessage)

				done()
			}
		})
	})

	describe('#create', () => {
		it('should make user join to newly created room', done => {
			//given
			const requestMock = {
				invitedUsersIndexes: []
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.emitSpy = sinon.spy(connection, 'emit')
				suite.newSocket = connection
				connection.on(CLIENT_EVENTS.CREATE, data => {
					suite.roomInstance.create(data, connection, suite.connectionsMock)
				})
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
			suite.client.on(CLIENT_EVENTS.JOIN, then)
			//when
			suite.client.emit(CLIENT_EVENTS.CREATE, requestMock)

			//then
			function then() {
				const shouldMatch = {
					payload: {
						username: suite.USERNAME_MOCK
					}
				}
				sinon.assert.calledWith(suite.emitSpy.secondCall, CLIENT_EVENTS.JOIN, sinon.match(shouldMatch))
				done()
			}
		})
	})

	describe('user chat invitations', () => {
		it('should make invited users join to newly created room', done => {
			//given
			const USER_A_USERNAME = 'userA'
			const USER_B_USERNAME = 'userB'
			const requestMock = {
				invitedUsersIndexes: [USER_B_USERNAME]
			}

			suite.getUsername = sinon.stub()
			suite.getUsername.onFirstCall().returns(USER_A_USERNAME)
			suite.getUsername.onSecondCall().returns(USER_B_USERNAME)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				suite.newSocket = connection
				connection.request.user = {}
				connection.request.user.username = suite.getUsername()
				suite[connection.request.user.username] = sinon.spy(connection, 'join')
				suite.roomInstance.connection(connection, suite.connectionsMock)

				connection.on(CLIENT_EVENTS.CREATE, data => {
					Promise.all([
						new Promise(resolve => suite.clientA.on(CLIENT_EVENTS.JOIN, resolve)),
						new Promise(resolve => suite.clientB.on(CLIENT_EVENTS.JOIN, resolve))
					]).then(then)
					suite.roomInstance.create(data, connection, suite.connectionsMock)
				})
			})
			
			suite.clientA = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
			suite.clientB = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.clientA.emit(CLIENT_EVENTS.CREATE, requestMock)

			//then
			function then() {
				console.log('then')
				suite.clientA.disconnect()
				suite.clientB.disconnect()

				sinon.assert.called(suite[USER_A_USERNAME])
				sinon.assert.called(suite[USER_B_USERNAME])
				done()
			}
		})
	})

	describe('communication between users', () => {
		beforeEach(() => {
			suite.clientA = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
			suite.clientB = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
		})

		afterEach(() => {
			suite.clientA.disconnect()
			suite.clientB.disconnect()
		})

		it('should enable communication between two users when they both join the same room', done => {
			//given
			const ROOM_ID = 'random room id'
			const joinRoomRequestMock = {
				roomId: ROOM_ID
			}

			const messageMock = {
				roomId: ROOM_ID,
				data: 'DUMMY MESSAGE'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)

				connection.on(CLIENT_EVENTS.MESSAGE, data => 
					suite.roomInstance.message(data, connection, suite.connectionsMock)
				)
			})
			
			//when
			suite.clientA.emit(CLIENT_EVENTS.JOIN, joinRoomRequestMock)
			suite.clientB.emit(CLIENT_EVENTS.JOIN, joinRoomRequestMock)

			const clientAJoinedRoom = new Promise(resolve => 
				suite.clientA.on(CLIENT_EVENTS.JOIN, resolve)
			)


			const clientBJoinedRoom = new Promise(resolve => 
				suite.clientB.on(CLIENT_EVENTS.JOIN, resolve)
			)

			//then
			Promise.all([clientAJoinedRoom, clientBJoinedRoom])
				.then(() => {
					suite.clientA.emit(CLIENT_EVENTS.MESSAGE, messageMock)}
				)

			suite.clientB.on(CLIENT_EVENTS.MESSAGE, then)

			function then() {
				done()
			}
		})

		it('should make users visible to each other when joining the same room', done => {
			//given
			const USER_A_USERNAME = 'userA'
			const USER_B_USERNAME = 'userB'


			const ROOM_ID = 'random room id'
			const joinRoomRequestMock = {
				roomId: ROOM_ID
			}

			const messageMock = {
				roomId: ROOM_ID
			}

			suite.getUsername = sinon.stub()
			suite.getUsername.onFirstCall().returns(USER_A_USERNAME)
			suite.getUsername.onSecondCall().returns(USER_B_USERNAME)

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => {
				connection.request.user = {}
				connection.request.user.username = suite.getUsername()
				connection.on(CLIENT_EVENTS.JOIN, data => 
					suite.roomInstance.join(data, connection, suite.connectionsMock)
				)

				connection.on(CLIENT_EVENTS.LIST_MEMBERS, data => 
					suite.roomInstance[CLIENT_EVENTS.LIST_MEMBERS](data, connection, suite.connectionsMock)
				)
			})
			
			//when
			suite.clientA.emit(CLIENT_EVENTS.JOIN, joinRoomRequestMock)
			suite.clientB.emit(CLIENT_EVENTS.JOIN, joinRoomRequestMock)

			const clientAJoinedRoom = new Promise(resolve => 
				suite.clientA.on(CLIENT_EVENTS.JOIN, resolve)
			)


			const clientBJoinedRoom = new Promise(resolve => 
				suite.clientB.on(CLIENT_EVENTS.JOIN, resolve)
			)

			//then
			Promise.all([clientAJoinedRoom, clientBJoinedRoom])
				.then(() => {
					suite.clientA.on(CLIENT_EVENTS.LIST_MEMBERS, then)
					suite.clientA.emit(CLIENT_EVENTS.LIST_MEMBERS, messageMock)
				})

			function then(data) {
				const EXPECTED_USERNAMES = [USER_A_USERNAME, USER_B_USERNAME]
				assert.deepEqual(data.payload.usernames, EXPECTED_USERNAMES)
				done()
			}
		})
	})
})

function mockModels() {
	let MessageModelMock = function () {
		this.save = () => Promise.resolve()
	}
	let RoomModelMock = function () {
		this.save = () => Promise.resolve()
	}
	MessageModelMock.find = (query, fields, cb) => {
		return Promise.resolve([{
			text: 'dummy text',
			author: 'dummy author',
			date: 32132321321132,
			roomId: 'DUMMY_ROOM'
		}])
	}
	RoomModelMock.find = (query, fields, cb) => {
		return Promise.resolve([])
	}

	RoomModelMock.findOne = (query, fields, cb) => {
		return Promise.resolve({
			id: 'DUMMY_ROOM',
			members: ['userA', 'userB'],
			save: () => Promise.resolve()
		})
	}
	
	mockRequire('../../../../models/message', MessageModelMock)
	mockRequire('../../../../models/room', RoomModelMock)
}