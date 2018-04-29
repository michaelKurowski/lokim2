
const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const EVENT_TYPES = namespaceInfo.eventTypes
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
	 * @property {string} username Username of user that joined (only for server-sourced emits)
	 */

	static [EVENT_TYPES.JOIN](data, socket, connections) {
		const {roomId} = data
		const username = socket.request.user.username

		socket.emit(EVENT_TYPES.JOIN, {username, roomId})
		socket.join(roomId)
	}

	/**
	 * User sends a message
	 * @name message
	 * @memberof Room
	 * @member
	 * @property {module:dataTypes.uuid} roomId Room to receive a message
	 * @property {string} message Text message
	 * @property {string} username Username of user that joined (only for server-sourced emits)
	 */

	static [EVENT_TYPES.MESSAGE](data, socket, connections) {
		const {roomId, message} = data
		const username = socket.request.user.username

		socket.to(roomId).emit(EVENT_TYPES.MESSAGE, {message, username})
	}

	/**
	 * User leaves a room
	 * @name leave
	 * @memberof Room
	 * @member
	 * @property {module:dataTypes.uuid} roomId Room to leave
	 * @property {string} username Username of user that joined (only for server-sourced emits)
	 */

	static [EVENT_TYPES.LEAVE](data, socket, connections) {
		const {roomId} = data

		socket.to(roomId).emit(EVENT_TYPES.LEAVE, {username: socket.request.user.username})
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
}

function joinUsersToRoom(invitedUsersIndexes, roomId, connections) {
	_.forEach(invitedUsersIndexes, username => {
		const invitedUserSocket = connections.usersToConnectionsMap.get(username)
		if (invitedUserSocket) Room.join({roomId}, invitedUserSocket, connections)
	})
}

module.exports = Room