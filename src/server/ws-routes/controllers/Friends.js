const namespaceInfo = require('../../protocol/protocol.json').friends
const EVENT_TYPES = namespaceInfo.eventTypes
const logger = require('../../logger')
const _ = require('lodash')
class Friends {
	constructor({
		PendingEventsModel = require('../../models/pendingEvents'),
		UserModel = require('../../models/user'),
		connectionRepository = require('../webSocketRouting').getConnectionRepository()
	} = {}) {
		this.PendingEventsModel = PendingEventsModel
		this.UserModel = UserModel
		this.usersToConnectionsMap = connectionRepository.usersToConnectionsMap
	}

	[EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.set(username, socket)
	}

	[EVENT_TYPES.LIST_FRIENDS](data, socket) {
		const username = socket.request.user.username
		return this.UserModel.findOne(username).exec()
			.then(user => socket.emit(EVENT_TYPES.LIST_FRIENDS, user.friends))
	}

	[EVENT_TYPES.INVITATION](data, socket) {
		const invitatedUsername = data.username
		const invitatingUsername = socket.request.user.username
		const removeInvitationEventFromDatabase = false 
		const emitPayload = {username: invitatingUsername}
		this.updatePendingEventsInDatabase(invitatingUsername, invitatedUsername, removeInvitationEventFromDatabase, EVENT_TYPES.INVITATION)
			.then(() => this.sendMessageToSepcificUser(socket, invitatedUsername, EVENT_TYPES.INVITATION, emitPayload))
			.catch(err => logger.error(err))
	}

	[EVENT_TYPES.CONFIRM_INVITATION](data, socket) {
		const invitatedUsername = socket.request.user.username
		const invitatingUsername = data.username
		const removeInvitationEventFromDatabase = true
		const removeConfirmationEventFromDatabase = false
		const searchCondition = {username: invitatedUsername}
		const emitPayload = {username: invitatedUsername}
		return this.PendingEventsModel.findOne(searchCondition).exec()
			.then(user => {
				const isInvitationExists = _.some(user.events, {username: invitatingUsername})
				if(isInvitationExists) {
					this.updatePendingEventsInDatabase(invitatingUsername, invitatedUsername, removeInvitationEventFromDatabase, EVENT_TYPES.INVITATION)
						.then(() => {
							this.addFriends(invitatingUsername, invitatedUsername)
							const isMessageSent = this.sendMessageToSepcificUser(socket, invitatingUsername, EVENT_TYPES.CONFIRM_INVITATION, emitPayload)
							if(!isMessageSent)
								this.updatePendingEventsInDatabase(invitatedUsername, invitatingUsername, removeConfirmationEventFromDatabase, EVENT_TYPES.CONFIRM_INVITATION)
						})
						.catch(err => logger.error(err))
				}
			})
	}

	[EVENT_TYPES.PENDING_EVENTS](data, socket) {
		const username = socket.request.user.username
		console.log(username)
		return this.PendingEventsModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.PENDING_EVENTS, user.events))
			.catch(err => logger.error(err))
	}

	sendMessageToSepcificUser(socket, recieverUsername, eventType, payload) {
		if (this.usersToConnectionsMap.has(recieverUsername)) {
			const invitatedUserSocketId = this.usersToConnectionsMap.get(recieverUsername).id
			socket.to(invitatedUserSocketId).emit(eventType, payload)
			return true
		}
		return false
	}

	updatePendingEventsInDatabase(sendingEventUsername, recievingEventUsername, removeEvent, eventType) {
		const updatedData = {
			events: {
				username: sendingEventUsername,
				eventType: eventType
			}
		}
		const searchConditions = {
			username: recievingEventUsername
		}
		let updateDataQuery = {$push:updatedData}
		if(removeEvent)
			updateDataQuery = {$pull:updatedData}

		const queryOptions = {upsert: true, new:true}
		return this.PendingEventsModel.findOneAndUpdate(searchConditions, updateDataQuery, queryOptions).exec()
	}

	addFriends(invitatingUsername, invitatedUsername) {
		const searchConditions = {
			$or: [
				{username: invitatingUsername},
				{username: invitatedUsername}
			]
		}
		this.UserModel.find(searchConditions).exec()
			.then(users => {
				_.forEach(users, user => {
					let friendData = {username: invitatedUsername}
					if(user.username == invitatedUsername)
						friendData.username = invitatingUsername

					user.friends.push(friendData)
					user.save()
				})
				
			})
			.catch(err => logger.error(err))
	}
}

module.exports = Friends