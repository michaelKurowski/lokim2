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
const NO_PENDING = Symbol('there are no pending inviations')
const DELETE_INVITATION = Symbol('Delete invitation')
const INVITATION_ACCEPTED = Symbol('User accepted your invitation')

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

		const invitedUsername = data.username
        
		getUserObject(username)
			.then(user => {
				if(user.friends.includes(invitedUsername))
					return Promise.reject(FRIENDS_ALREADY)

				return isInPendingInvitations(username, invitedUsername)
			})
			.then(pendingInvitations => {
				if(pendingInvitations.includes(invitedUsername))
					return Promise.reject(ALREADY_SENT_INVITATION)

				return PendingInvitationsModel.create({form:username, to:invitedUsername})
			})
			.then(() => { 
				sendToUser(socket, invitedUsername, connections, EVENT_TYPES.INVITE, NEW_INVITATION)
				sendResponse(socket, EVENT_TYPES.INVITE, INVITATION_SENT)
			})
			.catch(err => {
				if(err === FRIENDS_ALREADY || err === ALREADY_SENT_INVITATION)
					return sendResponse(socket, EVENT_TYPES.INVITE, err)

				logger.error(err)
				return sendResponse(socket, EVENT_TYPES.INVITE, PLEASE_TRY_AGAIN)
			})

	}
	/**
	 * @name confirm
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of user who invited requesting user
	 * @property {bool} confirm Accept or decline invitation
	 */

	[EVENT_TYPES.CONFIRM](data, socket, connections) {
		const username = socket.request.user.username
		const {confirm} = data
		const invitingUsername = data.username

		isInPendingInvitations(invitingUsername)
			.then(pendingInvitations => {
				if(pendingInvitations.includes(username))
					return Promise.resolve()
				return sendResponse(socket, EVENT_TYPES.CONFIRM, NO_PENDING.description)
			})
			.then(() => {
				if(confirm) {
					return addToFriendsList(invitingUsername, username)
				}
				return Promise.reject(DELETE_INVITATION)
			})
			.then(() => {
				const payload = username+' '+INVITATION_ACCEPTED.description
				const isSent = sendToUser(socket, invitingUsername, connections, EVENT_TYPES.CONFIRM, payload)
				if(isSent)
					return deletePendingInvitation(invitingUsername, username)
			})
			.catch(err => {
				if(err === DELETE_INVITATION)
					return deletePendingInvitation(invitingUsername, username)
				return Promise.reject(err)
			})
			.then(() => sendResponse(socket, EVENT_TYPES.CONFIRM, 'OK'))
			.catch(err => {
				logger.error(err)
				return sendResponse(socket, EVENT_TYPES.INVITE, PLEASE_TRY_AGAIN)
			})
		
	}
	
}
//TODO Add confirmation invitation field in pending invitations schema

async function addToFriendsList(fromUsername, toUsername) {
	const fromUserPromise = getUserObject(fromUsername)
	const toUserPromise = getUserObject(toUsername)

	const formUserObject = await fromUserPromise
	const toUserObject = await toUserPromise

	formUserObject.friends.push(toUsername)
	toUserObject.friends.push(fromUsername)

	return Promise.all([formUserObject.save(), toUserObject.save()])
}

function sendToUser(socket, toUsername, connections, eventType, payload) {
	const receivingUserSocketId = connections.usersToConnectionsMap.get(toUsername).id
	if(receivingUserSocketId !== null) {
		const response = new Response(eventType, payload)
		socket.to(receivingUserSocketId).emit(eventType, response.serialize())
		return true
	}
	return false
}

async function deletePendingInvitation(fromUsername, toUsername) {
	const deletedInitation = PendingInvitationsModel.deleteOne({from: fromUsername, to:toUsername}).exec()
	return await deletedInitation
}

function sendResponse(socketUser, eventType, payload) {
	const response = new Response(eventType, payload)
	socketUser.emit(eventType, response.serialize())
}

async function getUserObject(username) {
	const user =  UserModel.findOne({username}).exec()
	return await user
}

async function isInPendingInvitations(username) {
	const pendingInvitations = PendingInvitationsModel.find({from:username}, 'to').exec()
	return await pendingInvitations
}

module.exports = Friends