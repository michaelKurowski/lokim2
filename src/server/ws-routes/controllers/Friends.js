const namespaceInfo = require('../../protocol/protocol.json').friends
const EVENT_TYPES = namespaceInfo.eventTypes
const _ = require('lodash')

const MESSAGES = {
	ERRORS: {
		INVITATION_NOT_EXISTS: 'Invitation not Exists'
	}
}

/**
 * /Friends websocket namespace
 * @namespace
 */

class Friends {
	constructor({
		UserModel = require('../../models/user'),
		NotificationModel = require('../../models/notification'),
		utils = require('../utilities')
	} = {}) {
		this.UserModel = UserModel
		this.NotificationModel = NotificationModel
		this.utils = utils
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
			.catch(err => this.utils.errorWrapper(EVENT_TYPES.GET_FRIENDS_LIST, err))
	}

	/**
	 * User invites other user
	 * @name invite
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of invited user
	 */
	[EVENT_TYPES.INVITE](data, socket, connections) {
		const invitedUsername = data.username
		const invitingUsername = socket.request.user.username
		return this.isNotFriend(invitingUsername, invitedUsername)	
			.then(() => this.utils.addNotification(invitingUsername, invitedUsername, EVENT_TYPES.INVITE))
			.catch(() => socket.emit(EVENT_TYPES.INVITE, 'You are friends already.'))
			.then((notificationPayload) => this.utils.emitEventToUser(socket, connections, invitedUsername, EVENT_TYPES.INVITE, notificationPayload))
			.catch(err => this.utils.errorWrapper(EVENT_TYPES.INVITE, err))
	}

	/**
	 * @name invitationConfirmation
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of inviting user
	 */
	[EVENT_TYPES.INVITATION_CONFIRMATION](data, socket, connections) {
		const invitedUsername = socket.request.user.username
		const invitingUsername = data.username
		const payload = {username: invitedUsername}
		
		return this.UserModel.find(payload).exec()
			.then(user => {
				const notificationsArray = user[0].notifications
				const isNotificationAlreadyExisting = _.some(notificationsArray, {username: invitingUsername})
				if(isNotificationAlreadyExisting) return this.addFriend(invitingUsername, invitedUsername)

				socket.emit(EVENT_TYPES.INVITATION_CONFIRMATION, MESSAGES.ERRORS.INVITATION_NOT_EXISTS)
				return Promise.reject()
			})
			.then(() => {
				const isMessageSent = this.utils.emitEventToUser(socket, connections, invitingUsername, EVENT_TYPES.INVITATION_CONFIRMATION, payload)
				if(!isMessageSent)
					this.utils.addNotification(invitedUsername, invitingUsername, EVENT_TYPES.INVITATION_CONFIRMATION)
			})
			.catch(err => {
				this.utils.errorWrapper(EVENT_TYPES.INVITATION_CONFIRMATION, err)
			})
	}

	isNotFriend(invitingUsername, invitedUsername) {
		const searchingCriteria = {username: invitedUsername}
		return this.UserModel.findOne(searchingCriteria).exec()
			.then(user => {
				const friendsUsernameList = _.map( user.friends, friend => friend.username)
				if (_.includes(friendsUsernameList, invitingUsername))
					return Promise.reject()
			})
	}

	addFriend(invitingUsername, invitedUsername) {
		const searchConditions = {
			$or: [
				{username: invitingUsername},
				{username: invitedUsername}
			]
		}

		return this.UserModel.find(searchConditions).exec()
			.then(users => {
				const findingUsers = _.map(users, user => {
					let friendData = {username: invitedUsername}
					if(user.username === invitedUsername)
						friendData.username = invitingUsername
					user.friends.push(friendData)
					return user.save()
				})
				return Promise.all(findingUsers)
			})
	}
}

module.exports = Friends