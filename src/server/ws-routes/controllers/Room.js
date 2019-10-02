const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const EVENT_TYPES = namespaceInfo.eventTypes
const util = require('util')
const logger = require('../../logger')
const JoinResponse = require('../responses/JoinResponse.class')
const MessageResponse = require('../responses/MessageResponse.class')
const LeaveResponse = require('../responses/LeaveResponse.class')
const ListMembersResponse = require('../responses/ListMembersResponse.class')
const RoomModel = require('../../models/room')
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

	[EVENT_TYPES.JOIN](data, socket, connections) {
		const {roomId} = data
		if (_.isEmpty(roomId)) return
		const username = socket.request.user.username
		RoomModel.findOne({id: roomId}, 'id members')
			.then(room => {
				if (room !== null) {
					socket.join(roomId, () => {
						const response = new JoinResponse(username, roomId)
						socket.emit(EVENT_TYPES.JOIN, response.serialize())
						socket.to(roomId).emit(EVENT_TYPES.JOIN, response.serialize())
						this.listMembers(data, socket)
						if (room.members.indexOf(username) === -1) {
							room.members = [...room.members, username]
							room.save().catch(err => logger.error(err))
						}
					})
					return
				}
				this.create({invitedUsersIndexes: [], roomId}, socket, connections)
			})
			.catch(err => logger.error(err))
		

		
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
		const response = new MessageResponse(username, roomId, message)
		socket.emit(EVENT_TYPES.MESSAGE, response.serialize())
		socket.to(roomId).emit(EVENT_TYPES.MESSAGE, response.serialize())
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

		const username = socket.request.user.username
		const response = new LeaveResponse(username, roomId)
		socket.to(roomId).emit(EVENT_TYPES.LEAVE, response.serialize())
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
		const {invitedUsersIndexes, roomId} = data
		const roomInstance = new RoomModel({
			id: roomId || uuidv4(),
			members: [...invitedUsersIndexes, getUsername(socket)]
		})
		roomInstance.save()
			.then(() => {
				this.join({roomId}, socket, connections)
				joinUsersToRoom(invitedUsersIndexes, roomId, connections, this)
			})
			.catch(err => {
				logger.error(err)
			})

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
		const roomId = data.roomId
		const room = socket.nsp.in(roomId)
		getRoomClients(room)
			.then(clients => {
				const usernames = _.map(clients, socketId => 
					getUsername(room.connected[socketId]))
				const response = new ListMembersResponse(usernames, roomId)
				socket.emit(EVENT_TYPES.LIST_MEMBERS, response.serialize())
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

function joinUsersToRoom(invitedUsersIndexes, roomId, connections, controller) {
	_.forEach(invitedUsersIndexes, username => {
		const invitedUserSocket = connections.usersToConnectionsMap.get(username)
		if (invitedUserSocket) controller.join({roomId}, invitedUserSocket, connections)
	})
}

module.exports = Room