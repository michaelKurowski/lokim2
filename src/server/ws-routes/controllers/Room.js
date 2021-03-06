const uuidv4 = require('uuid/v4')
const _ = require('lodash')
const namespaceInfo =  require('../../protocol/protocol.json').room
const EVENT_TYPES = namespaceInfo.eventTypes
const logger = require('../../logger')
const JoinResponse = require('../responses/JoinResponse.class')
const MessageResponse = require('../responses/MessageResponse.class')
const LeaveResponse = require('../responses/LeaveResponse.class')
const ListMembersResponse = require('../responses/ListMembersResponse.class')
const RoomModel = require('../../models/room')
const MessageModel = require('../../models/message')
/**
 * /Room websocket namespace and its events
 * @namespace
 */
class Room {
	[EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.set(username, socket)
		return RoomModel.find({members: username}, 'id').exec()
			.then(rooms =>
				rooms.forEach(room => this.join({roomId: room.id}, socket, connections))
			)
			.catch(err => logger.error(err))
	}

	[EVENT_TYPES.DISCONNECT](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.delete(username)
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
		const username = socket.request.user.username
		const {roomId} = data
		if (_.isEmpty(roomId)) return
		RoomModel.findOne({id: roomId}, 'id members').exec()
			.then(room => {
				if (room !== null) 
					return joinWebsocketConnectionToRoom(socket, room.id)
						.then(broadcastInformationAboutNewMember.bind(null, socket, room.id))
						.then(updateRoomMembersListInMongo.bind(null, room, username))
				this.create({invitedUsersIndexes: [], roomId}, socket, connections)
			})
			.then(() => {
				if (!data.roomId) return
				return this.listMembers(data, socket)
			})
			.then(() => MessageModel.find({ roomId }, 'author text date').exec())
			.then(messages => {
				messages.forEach(message => {
					const response = new MessageResponse(message.author, roomId, message.text, message.date)
					socket.emit(EVENT_TYPES.MESSAGE, response.serialize())
				})
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
		return RoomModel.findOne({id: roomId}, 'members').exec()
			.then(room => {
				const isMemberOfRoom = room.members.indexOf(username) !== -1
				if (!isMemberOfRoom) return
				const response = new MessageResponse(username, roomId, message)
				const messageDataToSaveInDb = {
					author: username,
					text: message,
					roomId,
					date: response.date
				}
				const messageModelInstance = new MessageModel(messageDataToSaveInDb)
				messageModelInstance.save()
					.catch(err => logger.error(err))
				socket.emit(EVENT_TYPES.MESSAGE, response.serialize())
				socket.to(roomId).emit(EVENT_TYPES.MESSAGE, response.serialize())
			})
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
		socket.emit(EVENT_TYPES.LEAVE, response.serialize())
		socket.to(roomId).emit(EVENT_TYPES.LEAVE, response.serialize())
		socket.leave(roomId)
		return RoomModel.findOne({id: roomId}, 'members').exec()
			.then(room => {
				room.members = room.members.filter(member => member !== username)
				return room.save()
			})
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
		const roomDocument = {
			id: roomId || uuidv4(),
			members: [...invitedUsersIndexes, getUsername(socket)]
		}
		const roomInstance = new RoomModel(roomDocument)
		roomInstance.save()
			.then(() => {
				this.join({roomId: roomDocument.id}, socket, connections)
				joinUsersToRoom(invitedUsersIndexes, roomDocument.id, connections, this)
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
		return RoomModel.findOne({id: roomId}, 'members').exec()
			.then(room => {
				if (room === null) return
				const response = new ListMembersResponse(room.members, roomId)
				socket.emit(EVENT_TYPES.LIST_MEMBERS, response.serialize())
			})
			.catch(err => logger.error(err))
	}
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

function updateRoomMembersListInMongo(room, username) {
	if (room.members.indexOf(username) === -1) {
		room.members = [...room.members, username]
		return room.save().catch(err => logger.error(err))
	}
}

function broadcastInformationAboutNewMember(socket, roomId) {
	const username = socket.request.user.username
	const response = new JoinResponse(username, roomId)
	socket.emit(EVENT_TYPES.JOIN, response.serialize())
	socket.to(roomId).emit(EVENT_TYPES.JOIN, response.serialize())
}

function joinWebsocketConnectionToRoom(socket, roomId) {
	return new Promise(resolve => socket.join(roomId, resolve))
}

module.exports = Room