const namespaceInfo = require('../../protocol/protocol.json').notifications
const EVENT_TYPES = namespaceInfo.eventTypes
const logger = require('../../logger')

class Notifications {
	constructor({
		UserModel = require('../../models/user')
	} = {}) {
		this.UserModel = UserModel
	}

	[EVENT_TYPES.REMOVE_NOTIFICATIONS](data, socket) {
		const notificationIdsList = data.notificationIds
		const requestingUsername = socket.request.user.username
		return this.removeNotificationsfromArray(notificationIdsList, requestingUsername)
			.then(() => socket.emit(EVENT_TYPES.REMOVE_NOTIFICATIONS))
			.catch((err) => logger.error(err))
			
	}

	[EVENT_TYPES.GET_PENDING_NOTIFICATIONS](data, socket) {
		const username = socket.request.user.username
		return this.UserModel.findOne({username}).exec()
			.then(user => socket.emit(EVENT_TYPES.GET_PENDING_NOTIFICATIONS, user.pendingNotifications))
			.catch(err => logger.error(err))
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