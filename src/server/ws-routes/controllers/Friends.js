const namespaceInfo = require('../../protocol/protocol.json').friends
const EVENT_TYPES = namespaceInfo.eventTypes
const logger = require('../../logger')
const _ = require('lodash')
class Friends {
	constructor({
		UserModel = require('../../models/user')
	} = {}) {
		this.UserModel = UserModel
	}

	[EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.set(username, socket)
	}

	[EVENT_TYPES.FRIENDS_LIST](data, socket) {
		const {username} = socket.request.user
		return this.UserModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.FRIENDS_LIST, user.friends))
			.catch(err => logger.error(err))
	}

	[EVENT_TYPES.INVITE](data, socket, connections) {
		const invitatedUsername = data.username
		const invitatingUsername = socket.request.user.username
		const emitPayload = {username: invitatingUsername}
		return this.addNotification(invitatingUsername, invitatedUsername, EVENT_TYPES.INVITE)
			.then(() => this.sendMessageToSepcificUser(socket, connections, invitatedUsername, EVENT_TYPES.INVITE, emitPayload))
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
			.then(() => this.addNotification(invitedUsername, invitatingUsername, EVENT_TYPES.CONFIRM_INVITATION))
			.catch(err => logger.error(err))
	}

	[EVENT_TYPES.REMOVE_NOTIFICATIONS](data, socket) {
		const notificationIdsList = data.notificationIds
		const requestingUsername = socket.request.user.username
		return this.removeNotificationsfromList(notificationIdsList, requestingUsername)
			.then(() => socket.emit(EVENT_TYPES.REMOVE_NOTIFICATIONS, 'OK'))
			.catch((err) => logger.error(err))
			
	}

	[EVENT_TYPES.PENDING_NOTIFICATIONS](data, socket) {
		const username = socket.request.user.username
		return this.UserModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.PENDING_NOTIFICATIONS, user.pendingNotifications))
			.catch(err => logger.error(err))
	}

	sendMessageToSepcificUser(socket, connetcions, recieverUsername, eventType, payload) {
		if (connetcions.usersToConnectionsMap.has(recieverUsername)) {
			const invitatedUserSocketId = connetcions.usersToConnectionsMap.get(recieverUsername).id
			socket.to(invitatedUserSocketId).emit(eventType, payload)
			return true
		}
		return false
	}

	removeNotificationsfromList(notificationIdList, requestingUsername) {
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

	addNotification(sendingNotificationUsername, recievingNotificationUsername, notificationType) {
		const data = {
			pendingNotifications: {
				username: sendingNotificationUsername,
				notificationType
			}
		}
		const searchingCriteria = {
			username: recievingNotificationUsername
		}
		let updateDataQuery = {$push:data}
		return this.UserModel.findOneAndUpdate(searchingCriteria, updateDataQuery).exec()
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