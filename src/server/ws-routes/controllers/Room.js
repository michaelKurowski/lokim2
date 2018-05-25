const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const EVENT_TYPES = namespaceInfo.eventTypes
const util = require('util')
const logger = require('../../logger')
/**
 * /Room websocket namespace and its events
 * @namespace
 */
class Room {
	static [EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		const roomId = uuidv4()
		connections.usersToConnectionsMap.set(username, socket)
		Room.join({roomId}, socket, connections)
	}

	/**
	 * User joins a room
	 * @name join
	 * @memberof Room
	 * @member
	 * @property {module:dataTypes.uuid} roomId Room to join
	 * @property {string} username Username of the user that joined (only for server-sourced emits)
	 * @property {module:dataTypes.timestamp} timestamp Timestamp of when server acknowledged that user joined the room (only for server-sourced emits)
	 */

	static [EVENT_TYPES.JOIN](data, socket) {
		const {roomId} = data
		const username = socket.request.user.username
		const timestamp = new Date().getTime()
		
		socket.join(roomId, () => {
			socket.emit(EVENT_TYPES.JOIN, {username, roomId, timestamp})
			socket.to(roomId).emit(EVENT_TYPES.JOIN, {username, roomId, timestamp})
			Room.listMembers(data, socket)
		})
		
	}

	/**
	 * User sends a message
	 * @name message
	 * @memberof Room
	 * @member
	 * @property {module:dataTypes.uuid} roomId Room to receive a message
	 * @property {string} message Text message
	 * @property {string} username Username of the user that sent the message (only for server-sourced emits)
	 * @property {module:dataTypes.timestamp} timestamp Timestamp of when server acknowledged that message has been send (only for server-sourced emits)
	 */

	static [EVENT_TYPES.MESSAGE](data, socket) {
		const {roomId, message} = data
		const username = socket.request.user.username
		const timestamp = new Date().getTime()

		socket.to(roomId).emit(EVENT_TYPES.MESSAGE, {message, username, timestamp, roomId})
	}

	/**
	 * User leaves a room
	 * @name leave
	 * @memberof Room
	 * @member
	 * @property {module:dataTypes.uuid} roomId Room to leave
	 * @property {string} username Username of the user that left (only for server-sourced emits)
	 * @property {module:dataTypes.timestamp} timestamp Timestamp of when server acknowledged that user left the room (only for server-sourced emits)
	 */

	static [EVENT_TYPES.LEAVE](data, socket) {
		const {roomId} = data

		const timestamp = new Date().getTime()
		const username = socket.request.user.username
		socket.to(roomId).emit(EVENT_TYPES.LEAVE, {username, timestamp})
		socket.leave({roomId})
	}

	/**
	 * User creates a room with choosed users
	 * @name create
	 * @memberof Room
	 * @member
	 * @property {string[]} invitedUsersIndexes List of users usernames
	 */

	static [EVENT_TYPES.CREATE](data, socket, connections) {
		const {invitedUsersIndexes} = data
		const roomId = uuidv4()

		Room.join({roomId}, socket, connections)
		joinUsersToRoom(invitedUsersIndexes, roomId, connections)
	}

	/**
	 * Lists members of a room
	 * @name listMembers
	 * @memberof Room
	 * @member
	 * @property {module:dataTypes.uuid} roomId Room to probe
	 * @property {module:dataTypes.timestamp} timestamp Timestamp of when server acknowledged that user left the room (only for server-sourced emits)
	 * @property {string[]} usernames Users in the probed room (only for server-sourced emits)
	*/

	static async [EVENT_TYPES.LIST_MEMBERS](data, socket) {
		const timestamp = new Date().getTime()
		const roomId = data.roomId
		const room = socket.nsp.in(roomId)
		getRoomClients(room)
			.then(clients => {
				const usernames = _.map(clients, socketId => 
					getUsername(room.connected[socketId]))
				socket.emit(EVENT_TYPES.LIST_MEMBERS,
					{roomId, timestamp, usernames})
			})
			.catch(err => logger.error(err))
	}
}

async function getRoomClients(room) {
	const getClients = room.clients.bind(room)
	return await util.promisify(getClients)()
}

function getUsername(socket) {
	return socket.request.user.username
}

function joinUsersToRoom(invitedUsersIndexes, roomId, connections) {
	_.forEach(invitedUsersIndexes, username => {
		const invitedUserSocket = connections.usersToConnectionsMap.get(username)
		if (invitedUserSocket) Room.join({roomId}, invitedUserSocket, connections)
	})
}

module.exports = Room