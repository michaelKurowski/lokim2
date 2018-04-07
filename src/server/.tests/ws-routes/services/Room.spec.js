//const assert = require('chai').assert
const _ = require('lodash')
//const sinon = require('sinon')
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
		/*
		it('should new user be added to connections repository when connected', done => {

		})
		*/
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
	})

	describe('#message', () => {

	})

	describe('#leave', () => {

	})

	describe('#create', () => {

	})
})