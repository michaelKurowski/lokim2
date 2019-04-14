const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const EVENT_TYPES = namespaceInfo.eventTypes
const roomController = require('../../controllers/room')
const util = require('util')
const logger = require('../../logger')
/**
 * /Room websocket namespace and its events
 * @namespace
 */
class Room {
	[EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.set(username, socket)
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

	[EVENT_TYPES.JOIN](data, socket) {
		const {roomId} = data
		if (_.isEmpty(roomId)) return
		const username = socket.request.user.username
		const timestamp = new Date().getTime()
		
		socket.join(roomId, () => {
			socket.emit(EVENT_TYPES.JOIN, {username, roomId, timestamp})
			socket.to(roomId).emit(EVENT_TYPES.JOIN, {username, roomId, timestamp})
			this.listMembers(data, socket)
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

	[EVENT_TYPES.MESSAGE](data, socket) {
		const {roomId, message} = data
		const username = socket.request.user.username
		const timestamp = new Date().getTime()
		socket.emit(EVENT_TYPES.MESSAGE, {message, username, timestamp, roomId})
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

	[EVENT_TYPES.LEAVE](data, socket) {
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

	[EVENT_TYPES.CREATE](data, socket, connections) {
		const {invitedUsersIndexes} = data
		const roomId = uuidv4()

		this.join({roomId}, socket, connections)
		joinUsersToRoom(invitedUsersIndexes, roomId, connections, this)
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

	[EVENT_TYPES.LIST_MEMBERS](data, socket) {
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

	/**
	 * Sends all messages currently in the Room
	 * @name allMessages
	 * @memberof Room
	 * @member
	 * 
	 */

	 [EVENT_TYPES.ALL_MESSAGES](data, socket){
		const roomId = data.roomId
		const roomData = getMessagesForCurrentRoom(roomId)

		socket.emit(EVENT_TYPES.ALL_MESSAGES, {roomId, roomData})
	 }

}

async function getRoomClients(room) {
	const getClients = room.clients.bind(room)
	return await util.promisify(getClients)()
}

function getUsername(socket) {
	return socket.request.user.username
}

function joinUsersToRoom(invitedUsersIndexes, roomId, connections, controller) {
	_.forEach(invitedUsersIndexes, username => {
		const invitedUserSocket = connections.usersToConnectionsMap.get(username)
		if (invitedUserSocket) controller.join({roomId}, invitedUserSocket, connections)
	})
}

function getMessagesForCurrentRoom(roomId){
	/**
	 * 1. Query for room via room ID
	 * 2. Send messages if they exist
	 */
}

function appendMessageToHistory(roomId, message, username){
	if(_.isEmpty([roomId, message, username])) throw new Error('Saving a message requires a roomId, message text and author\'s username')

	const room = /* room.findOne(roomId) */ null

	const message = {
		author: username,
		body: message,
		creationDate: Date.now()
	}

	/**
	 * 1. Check if parameters are valid
	 * 2. Find room via roomId
	 * 3. Create message object
	 * 4. Append new message object to the existing array of messages
	 * 5. Save
	 */
}
module.exports = Room