const logger = require('../logger')

const addNotification = (NotificationModel, UserModel, sendingNotificationUsername, recievingNotificationUsername, notificationType) => {
	const notificationData = {
		username: sendingNotificationUsername,
		notificationType
	}
	const searchingCriteria = {
		username: recievingNotificationUsername
	}
	const newNotification = new NotificationModel(notificationData)

	return UserModel.findOne(searchingCriteria).exec()
		.then(user => {
			user.pendingNotifications.push(newNotification)
			return user.save()
		})
		.then(() => newNotification)	
}

const sendMessageToSepcificUser = (socket, connetcions, recieverUsername, eventType, payload) => {
	if (connetcions.usersToConnectionsMap.has(recieverUsername)) {
		const receivingUserSocketId = connetcions.usersToConnectionsMap.get(recieverUsername).id
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
	sendMessageToSepcificUser,
	errorWrapper
}