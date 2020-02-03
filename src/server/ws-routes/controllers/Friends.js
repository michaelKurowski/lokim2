const EVENT_TYPES = require('../../protocol/protocol.json').frineds
const UserModel = require('../../models/user')
const PendingInvitationsModel = require('../../models/pendingInvitations')
const Response = require('../responses/Response.class')
const logger = require('../../logger')

/**
 * /Friends websocket namespace and its events
 * @namespace
 */

const NEW_INVITATION = Symbol('New invitation')
const INVITATION_SENT = Symbol('Invitation sent to user')

const FRIENDS_ALREADY = Symbol('You are already friends')
const ALREADY_SENT_INVITATION = Symbol('You have already sent invitation to this user')

const PLEASE_TRY_AGAIN = Symbol('Please try again')

class Friends {
	[EVENT_TYPES.CONNECTION](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.set(username, socket)
	}

	[EVENT_TYPES.DISCONNECT](socket, connections) {
		const username = socket.request.user.username
		connections.usersToConnectionsMap.delete(username) 
	}

	/**
	 * @name invite
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of user that you want to invite to friends list
	 */

	[EVENT_TYPES.INVITE](data, socket, connections) {
		const username = socket.request.user.username
		const userSocket = connections.usersToConnectionsMap.get(username)

		const invitedUsername = data.username
        
		getUserObject(username)
			.then(user => {
				if(user.friends.includes(invitedUsername))
					return Promise.reject(FRIENDS_ALREADY)

				return isInPendingInvitations(username, invitedUsername)
			})
			.then(() => PendingInvitationsModel.create({form:username, to:invitedUsername}))
			.then(() => { 
				sendToUser(username, invitedUsername, connections, EVENT_TYPES.INVITE, NEW_INVITATION)
				sendResponse(userSocket, EVENT_TYPES.INVITE, INVITATION_SENT)
			})
			.catch(err => {
				if(err === FRIENDS_ALREADY || err === ALREADY_SENT_INVITATION)
					return sendResponse(userSocket, EVENT_TYPES.INVITE, err)

				logger.error(err)
				return sendResponse(userSocket, EVENT_TYPES.INVITE, PLEASE_TRY_AGAIN)
			})

	}
}

function sendToUser(fromUsername, toUsername, connections, eventType, payload) {
	const userSocket = connections.usersToConnectionsMap.get(fromUsername)
	const receivingUserSocketId = connections.usersToConnectionsMap.get(toUsername).id
	if(receivingUserSocketId !== null) {
		const response = new Response(eventType, payload)
		userSocket.to(receivingUserSocketId).emit(eventType, response.serialize())
	}
}

function sendResponse(socketUser, eventType, payload) {
	const response = new Response(eventType, payload)
	socketUser.emit(eventType, response.serialize())
}

async function getUserObject(username) {
	const user =  UserModel.findOne({username}).exec()
	return await user
}

async function isInPendingInvitations(username, invitedUsername) {
	const pendingInvitations = await PendingInvitationsModel.find({from:username}, 'to').exec()

	if(pendingInvitations.length === 0)
		return Promise.reject('emptyPendingInvitationArray')

	if(pendingInvitations.includes(invitedUsername))
		return Promise.reject(ALREADY_SENT_INVITATION)	
	return Promise.resolve() 
}

module.exports = Friends