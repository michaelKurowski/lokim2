const namespaceInfo = require('../../protocol/protocol.json').notifications
const EVENT_TYPES = namespaceInfo.eventTypes

/**
 *  /Notifications websocket namespace
 * @namespace
 */
class Notifications {
	constructor({
		UserModel = require('../../models/user'),
		utils = require('../utilities')
	} = {}) {
		this.UserModel = UserModel
		this.utils = utils
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
		const searchingCriteria = {username: requestingUsername}
		const query = {	
			$pull: {
				pendingNotifications: {
					$or: notificationIdsList
				}
			}
		}
		return this.UserModel.findOneAndUpdate(searchingCriteria, query).exec()
			.then(() => socket.emit(EVENT_TYPES.REMOVE_NOTIFICATIONS, notificationIdsList))
			.catch(err => this.utils.errorWrapper(EVENT_TYPES.REMOVE_NOTIFICATIONS, err))
			
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
			.catch(err => this.utils.errorWrapper(EVENT_TYPES.GET_PENDING_NOTIFICATIONS, err))
	}
}

module.exports = Notifications