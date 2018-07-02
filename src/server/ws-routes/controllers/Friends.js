const namespaceInfo = require('../../protocol/protocol.json').friends
const EVENT_TYPES = namespaceInfo.eventTypes
const errorWrapper = require('../../utilities').errorWrapper
const _ = require('lodash')

/**
 * /Friends websocket namespace
 * @namespace
 */

class Friends {
	constructor({
		UserModel = require('../../models/user'),
		Notifications = require('./Notifications')
	} = {}) {
		this.UserModel = UserModel
		this.Notifications = Notifications
	}

	[EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.set(username, socket)
	}

	/**
	 * User gets list of own friends
	 * @name getFriendsList
	 * @memberof Friends
	 */

	[EVENT_TYPES.GET_FRIENDS_LIST](data, socket) {
		const {username} = socket.request.user
		return this.UserModel.find({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.GET_FRIENDS_LIST, user.friends))
			.catch(err => errorWrapper(EVENT_TYPES.GET_FRIENDS_LIST, err))
	}

	/**
	 * User invites other user
	 * @name invite
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of user that want to invite
	 */
	[EVENT_TYPES.INVITE](data, socket, connections) {
		const invitatedUsername = data.username
		const invitatingUsername = socket.request.user.username
		const emitPayload = {username: invitatingUsername}
		return this.Notifications.addNotification(this.UserModel, invitatingUsername, invitatedUsername, EVENT_TYPES.INVITE)
			.then(() => this.sendMessageToSepcificUser(socket, connections, invitatedUsername, EVENT_TYPES.INVITE, emitPayload))
			.catch(err => errorWrapper(EVENT_TYPES.INVITE, err))
	}

	/**
	 * @name invitationConfirmation
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of user which sent invitation
	 */
	[EVENT_TYPES.INVITATION_CONFIRMATION](data, socket, connections) {
		const invitedUsername = socket.request.user.username
		const invitatingUsername = data.username
		const payload = {username: invitedUsername}

		return this.UserModel.find(payload).exec()
			.then(user => {
				const pendingNotificationsArray = user[0].pendingNotifications
				const isEventExist = _.some(pendingNotificationsArray, {username: invitatingUsername})
				if(isEventExist) return this.addFriends(invitatingUsername, invitedUsername)
				return Promise.reject()
			})
			.then(() => {
				const isMessageSent = this.sendMessageToSepcificUser(socket, connections, invitatingUsername, EVENT_TYPES.INVITATION_CONFIRMATION, payload)
				if(!isMessageSent)
					this.Notifications.addNotification(this.UserModel, invitedUsername, invitatingUsername, EVENT_TYPES.INVITATION_CONFIRMATION)
			})
			.catch(err => errorWrapper(EVENT_TYPES.INVITATION_CONFIRMATION, err))
	}

	sendMessageToSepcificUser(socket, connetcions, recieverUsername, eventType, payload) {
		if (connetcions.usersToConnectionsMap.has(recieverUsername)) {
			const receivingUserSocketId = connetcions.usersToConnectionsMap.get(recieverUsername).id
			socket.to(receivingUserSocketId).emit(eventType, payload)
			return true
		}
		return false
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