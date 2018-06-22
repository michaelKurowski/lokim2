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

	[EVENT_TYPES.FRIENDS_LIST](data, socket) {
		const username = socket.request.user.username
		return this.UserModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.FRIENDS_LIST, user.friends))
	}

	[EVENT_TYPES.INVITE](data, socket) {
		const invitatedUsername = data.username
		const invitatingUsername = socket.request.user.username
		const emitPayload = {username: invitatingUsername}
		return this.addNotification(invitatingUsername, invitatedUsername, EVENT_TYPES.INVITE)
			.then(() => this.sendMessageToSepcificUser(socket, invitatedUsername, EVENT_TYPES.INVITE, emitPayload))
			.catch(err => logger.error(err))
	}

	[EVENT_TYPES.CONFIRM_INVITATION](data, socket) {
		const invitedUsername = socket.request.user.username
		const invitatingUsername = data.username
		const payload = {username: invitedUsername}

		return this.UserModel.findOne(payload).exec()
			.then(user => {
				const isEventExist = _.some(user.pendingNotifications, {username: invitatingUsername})
				if(isEventExist) return this.addFriends(invitatingUsername, invitedUsername)
				return Promise.reject()
			})
			.then(() => {
				const isSentToUser = this.sendMessageToSepcificUser(socket, invitatingUsername, EVENT_TYPES.CONFIRM_INVITATION, payload)
				if(!isSentToUser)
					this.addNotification(invitedUsername, invitatingUsername, EVENT_TYPES.CONFIRM_INVITATION)
			})
			.catch(err => logger.error(err)) 
	}

	[EVENT_TYPES.REMOVE_NOTIFICATIONS](data, socket) {
		const notificationIdsList = data.notificationIds
		const requestingUsername = socket.request.user.username
		this.removeNotifications(notificationIdsList, requestingUsername)
			.then(() => socket.emit(EVENT_TYPES.REMOVE_NOTIFICATIONS, 'OK'))
			.catch((err) => logger.error(err))
		
	}

	[EVENT_TYPES.PENDING_NOTIFICATIONS](data, socket) {
		const username = socket.request.user.username
		return this.UserModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.PENDING_NOTIFICATIONS, user.pendingNotifications))
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

	removeNotifications(notificationIdList, requestingUsername) {
		const query ={	
			$pull: {
				pendingNotifications: {
					$or: notificationIdList
				}
			}
		}
		const searchingCriteria = {username: requestingUsername}
		return this.UserModel.findOneAndUpdate(searchingCriteria, query).exec()
	}

	addNotification(sendingEventUsername, recievingEventUsername, notificationType) {
		const updatedData = {
			pendingNotifications: {
				username: sendingEventUsername,
				notificationType
			}
		}
		const searchConditions = {
			username: recievingEventUsername
		}
		let updateDataQuery = {$push:updatedData}
		return this.UserModel.findOneAndUpdate(searchConditions, updateDataQuery).exec()
	}

	addFriends(invitatingUsername, invitatedUsername) {
		const searchConditions = {
			$or: [
				{username: invitatingUsername},
				{username: invitatedUsername}
			]
		}

		return this.UserModel.find(searchConditions).exec()
			.then(users => {
				const findingUsers = _.map(users, user => {
					let friendData = {username: invitatedUsername}
					if(user.username == invitatedUsername)
						friendData.username = invitatingUsername
					user.friends.push(friendData)
					return user.save()
				})
				return Promise.all(findingUsers)
			})
	}
}

module.exports = Friends