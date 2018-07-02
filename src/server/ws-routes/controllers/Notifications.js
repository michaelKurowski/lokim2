const namespaceInfo = require('../../protocol/protocol.json').notifications
const EVENT_TYPES = namespaceInfo.eventTypes
const errorWrapper = require('../../utilities').errorWrapper

/**
 *  /Notifications websocket namespace
 * @namespace
 */
class Notifications {
	constructor({
		UserModel = require('../../models/user')
	} = {}) {
		this.UserModel = UserModel
	}

	/**
	 * Remove notifications
	 * @name removeNotifications
	 * @memberof Notifications
	 * @member
	 * @property {object[]} notificationIds Array of all ids of notifications you want to remove
	 * @property {string} _id Id of notification in array object
	 */
	[EVENT_TYPES.REMOVE_NOTIFICATIONS](data, socket) {
		const notificationIdsList = data.notificationIds
		const requestingUsername = socket.request.user.username
		return this.removeNotificationsfromArray(notificationIdsList, requestingUsername)
			.then(() => socket.emit(EVENT_TYPES.REMOVE_NOTIFICATIONS))
			.catch(err => errorWrapper(EVENT_TYPES.REMOVE_NOTIFICATIONS, err))
			
	}

	/**
	 * User gets list of pending notifications
	 * @name getPendingNotifications
	 * @memberof Notifications
	 */
	[EVENT_TYPES.GET_PENDING_NOTIFICATIONS](data, socket) {
		const {username} = socket.request.user
		return this.UserModel.find({username}).exec()
			.then(users => {
				const pendingNotificationsArray = users[0].pendingNotifications
				socket.emit(EVENT_TYPES.GET_PENDING_NOTIFICATIONS, pendingNotificationsArray)
			})
			.catch(err => errorWrapper(EVENT_TYPES.GET_PENDING_NOTIFICATIONS, err))
	}

	removeNotificationsfromArray(notificationIdList, requestingUsername) {
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

	static addNotification(userModel, sendingNotificationUsername, recievingNotificationUsername, notificationType) {
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
		return userModel.findOneAndUpdate(searchingCriteria, updateDataQuery).exec()
	}
}

module.exports = Notifications