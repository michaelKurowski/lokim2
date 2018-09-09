const logger = require('../logger')

const addNotification = (sendingNotificationUsername, receivingNotificationUsername, notificationType, 
	NotificationModel= require('../models/notification'), 
	UserModel = require('../models/user')) => {
		
	const notificationData = {
		username: sendingNotificationUsername,
		notificationType
	}
	const searchingCriteria = {
		username: receivingNotificationUsername
	}
	const newNotification = new NotificationModel(notificationData)

	return UserModel.findOne(searchingCriteria).exec()
		.then(user => {
			user.pendingNotifications.push(newNotification)
			return user.save()
		})
		.then(() => newNotification)	
}

const emitEventToUser = (socket, connections, receivingUsername, eventType, payload) => {
	if (connections.usersToConnectionsMap.has(receivingUsername)) {
		const receivingUserSocketId = connections.usersToConnectionsMap.get(receivingUsername).id
		socket.to(receivingUserSocketId).emit(eventType, payload)
		return true
	}
	return false
}

const errorWrapper = (event, err) => {
	logger.error(`${event}: ${err}`)
}

module.exports = {
	addNotification,
	emitEventToUser,
	errorWrapper
}