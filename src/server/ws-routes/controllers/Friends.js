const namespaceInfo = require('../../protocol/protocol.json').friends
const EVENT_TYPES = namespaceInfo.eventTypes
const logger = require('../../logger')
const _ = require('lodash')
class Friends {
	constructor({
		UserModel = require('../../models/user'),
		connectionRepository = require('../webSocketRouting').getConnectionRepository()
	} = {}) {
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
		return this.updatePendingEventsInDatabase(invitatingUsername, invitatedUsername, removeInvitationEventFromDatabase, EVENT_TYPES.INVITATION)
			.then(() => this.sendMessageToSepcificUser(socket, invitatedUsername, EVENT_TYPES.INVITATION, emitPayload))
			.catch(err => logger.error(err))
	}

	[EVENT_TYPES.CONFIRM_INVITATION](data, socket) {
		const invitedUsername = socket.request.user.username
		const invitatingUsername = data.username
		const payload = {username: invitedUsername}

		return this.UserModel.findOne(payload).exec()
			.then(user => {
				const isEventExist = _.some(user.invitations, {username: invitatingUsername})
				if(isEventExist) {
					const isSentToUser = this.sendMessageToSepcificUser(socket, invitatingUsername, EVENT_TYPES.CONFIRM_INVITATION, payload)
					if(!isSentToUser) {
						const removeConfirmationNotification = false
						this.updatePendingEventsInDatabase(invitatingUsername, invitedUsername, removeConfirmationNotification, EVENT_TYPES.CONFIRM_INVITATION)
					}
				}
			})
			.catch(err => logger.error(err)) 
	}

	[EVENT_TYPES.REMOVE_EVENTS](data, socket) {
		const eventsIds = data.eventsIds
		const username = socket.request.user.username
		const query ={	
			$pull: {
				invitations: {
					$elemMatch: [eventsIds]
				}
			}
		}
		this.UserModel.findOneAndUpdate({username}, query).exec()
			.then(() => socket.emit(EVENT_TYPES.REMOVE_EVENTS, 'OK'))
			.catch((err) => logger.error(err))
		
	}

	[EVENT_TYPES.PENDING_EVENTS](data, socket) {
		const username = socket.request.user.username
		return this.UserModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.PENDING_EVENTS, user.invitations))
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
			invitations: {
				username: sendingEventUsername,
				eventType
			}
		}
		const searchConditions = {
			username: recievingEventUsername
		}
		let updateDataQuery = {$push:updatedData}
		if(removeEvent)
			updateDataQuery = {$pull:updatedData}

		const queryOptions = {upsert: true, new:true}
		return this.UserModel.findOneAndUpdate(searchConditions, updateDataQuery, queryOptions).exec()
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