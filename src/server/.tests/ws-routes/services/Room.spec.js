const assert = require('chai').assert
const _ = require('lodash')
const sinon = require('sinon')
const socketClient = require('socket.io-client')
const io = require('socket.io')
const RoomProvider = require('../../../ws-routes/services/Room')

const namespaceInfo = require('../../../protocol/protocol.json').room
const SERVER_EVENTS = namespaceInfo.serverEventTypes
const CLIENT_EVENTS = namespaceInfo.eventTypes
const SOCKET_PORT = 5000
const SOCKET_URL = `http://0.0.0.0:${SOCKET_PORT}`
const SOCKET_OPTIONS = {
	transports: ['websocket'],
	'force new connection': true
}


let suite
describe('Room websocket service', () => {
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
	})

	afterEach(done => {
		suite.server.close(done)
		if (_.isFunction(suite.client.disconnect)) suite.client.disconnect()
	})

	describe('#connection', () => {
		it('should send joined event when connected', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => RoomProvider.connection(socket, suite.connectionsMock))

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//then
			suite.client.on(SERVER_EVENTS.JOINED, then)
			function then(data) {
				done()
			}
		})

		it('should new entry be added with its key as user name to connections repository when connected', done => {
			//given
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => RoomProvider.connection(socket, suite.connectionsMock))

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//then
			suite.client.on(SERVER_EVENTS.JOINED, then)
			function then(data) {
				const hasSessionStored = suite.connectionsMock.usersToConnectionsMap.has(suite.USERNAME_MOCK)
				assert.isTrue(hasSessionStored)
				done()
			}
		})

		it('should add a new entry to connections list which is instance of socket when connecting to Room namespace', done => {
			//given
			
			suite.server.on(CLIENT_EVENTS.CONNECTION, socket => {
				suite.newSocket = socket
				RoomProvider.connection(socket, suite.connectionsMock)
			})

			//when
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//then
			suite.client.on(SERVER_EVENTS.JOINED, then)
			function then(data) {
				const storedSession = suite.connectionsMock.usersToConnectionsMap.get(suite.USERNAME_MOCK)
				assert.isTrue(storedSession === suite.newSocket)
				done()
			}
		})
	})

	describe('#join', () => {
		it('should send "joined" event when receiving "join" request', done => {
			//given
			const requestMock = {
				roomId: 'random room id'
			}

			suite.server.on(CLIENT_EVENTS.CONNECTION, connection => 
				connection.on(CLIENT_EVENTS.JOIN, data => 
					RoomProvider.join(data, connection, suite.connectionsMock)
				)
			)
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(SERVER_EVENTS.JOINED, then)
			function then(data) {
				done()
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
					RoomProvider.join(data, connection, suite.connectionsMock)
				)
			})
			
			suite.client = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.client.emit(CLIENT_EVENTS.JOIN, requestMock)

			//then
			suite.client.on(SERVER_EVENTS.JOINED, then)
			function then(data) {
				assert.isTrue(suite.roomJoinSpy.calledOnce)
				done()
			}
		})
	})

	describe('#message', () => {

	})

	describe('#leave', () => {

	})

	describe('#create', () => {

	})

	describe('communication between users', () => {
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
					RoomProvider.join(data, connection, suite.connectionsMock)
				)

				connection.on(CLIENT_EVENTS.MESSAGE, data => 
					RoomProvider.message(data, connection, suite.connectionsMock)
				)
			})
			
			suite.clientA = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)
			suite.clientB = socketClient.connect(SOCKET_URL, SOCKET_OPTIONS)

			//when
			suite.clientA.emit(CLIENT_EVENTS.JOIN, joinRoomRequestMock)
			suite.clientB.emit(CLIENT_EVENTS.JOIN, joinRoomRequestMock)

			const clientAJoinedRoom = new Promise(resolve => 
				suite.clientA.on(SERVER_EVENTS.JOINED, resolve)
			)


			const clientBJoinedRoom = new Promise(resolve => 
				suite.clientB.on(SERVER_EVENTS.JOINED, resolve)
			)

			//then

			Promise.all([clientAJoinedRoom, clientBJoinedRoom])
				.then(() => {
					suite.clientA.emit(CLIENT_EVENTS.MESSAGE, messageMock)}
				)

			suite.clientB.on(CLIENT_EVENTS.MESSAGE, then)

			function then(data) {
				suite.clientA.disconnect()
				suite.clientB.disconnect()
				done()
			}
		})
	})
})