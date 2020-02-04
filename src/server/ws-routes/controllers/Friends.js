const _ = require('lodash')

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

const WRONG_LIST_TYPE = Symbol('Wrong list type')

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

				const queryField = 'from'
				const searchField = 'to'
				return getPendingInvitations(username, queryField, searchField)
			})
			.then(pendingInvitations => {
				if(pendingInvitations.includes(invitedUsername))
					return Promise.reject(ALREADY_SENT_INVITATION)

				return PendingInvitationsModel.create({form:username, to:invitedUsername})
			})
			.then(() => { 
				sendToUser(socket, invitedUsername, connections, EVENT_TYPES.INVITE, NEW_INVITATION)
				sendResponse(socket, EVENT_TYPES.INVITE, INVITATION_SENT.description)
			})
			.catch(err => {
				if(err === FRIENDS_ALREADY || err === ALREADY_SENT_INVITATION)
					return sendResponse(socket, EVENT_TYPES.INVITE, err.description)

				logger.error(err)
				return sendResponse(socket, EVENT_TYPES.INVITE, PLEASE_TRY_AGAIN.description)
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

		const queryField = 'from'
		const searchField = 'to'
		getPendingInvitations(invitingUsername, queryField, searchField)
			.then(pendingInvitations => {
				if(pendingInvitations.includes(username))
					return Promise.resolve()
				return sendResponse(socket, EVENT_TYPES.CONFIRM, NO_PENDING.description)
			})
			.then(() => {
				if(confirm) {
					const addMode = true
					return manageFriendsList(invitingUsername, username, addMode)
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

	/**
	 * @name list
	 * @memberof Friends
	 * @member
	 * @property {string} type What type do you want to receive. You can choose between: 
	 * accepted - accepted invitations, 
	 * pending - pending invitations, 
	 * friends - your friends list
	 */
	[EVENT_TYPES.LIST](data, socket) {
		const username = socket.request.user.username
		const {type} = data

		const PENDING_TYPE = Symbol('pending')
		const ACCEPTED_TYPE = Symbol('accepted')
		const FRIENDS_TYPE = Symbol('friends')

		const queryField = 'to'
		const searchField = 'from'
		
		switch(type) {

			case PENDING_TYPE.description:
			case ACCEPTED_TYPE.description:
				getPendingInvitations(username, queryField, searchField)
					.then(pendingInvitations => {

						return sendResponse(socket, EVENT_TYPES.LIST, pendingInvitations)
					})	
					.catch(err => {
						logger.error(err)
						return sendResponse(socket, EVENT_TYPES.LIST, PLEASE_TRY_AGAIN.description)
					})
				break

			case FRIENDS_TYPE.description:
				getUserObject(username)
					.then(user => sendResponse(socket, EVENT_TYPES.LIST, user.frineds))
					.catch(err => {
						logger.error(err)
						return sendResponse(socket, EVENT_TYPES.LIST, PLEASE_TRY_AGAIN.description)
					})
				break
			default: return sendResponse(socket, EVENT_TYPES.LIST, WRONG_LIST_TYPE.description)
		}
	}
	
	/**
	 * @name deleteFriend
	 * @memberof Friends
	 * @member
	 * @property {string} username Username of user you want to remove from your friends list
	 */
	[EVENT_TYPES.DELETE_FRIEND](data, socket) {
		const username = socket.request.user.username
		const friendUsername = data.username

		const addMode = false
		manageFriendsList(username,friendUsername, addMode)
			.then(() => sendResponse(socket, EVENT_TYPES.DELETE_FRIEND, 'OK'))
			.catch(err => {
				logger.error(err)
				return sendResponse(socket, EVENT_TYPES.DELETE_FRIEND, PLEASE_TRY_AGAIN.description)
			})

	}
}
//TODO Add confirmation invitation field in pending invitations schema

async function manageFriendsList(fromUsername, toUsername, addMode) {
	const fromUserPromise = getUserObject(fromUsername)
	const toUserPromise = getUserObject(toUsername)

	const formUserObject = await fromUserPromise
	const toUserObject = await toUserPromise
	if(addMode) {
		formUserObject.friends.push(toUsername)
		toUserObject.friends.push(fromUsername)
	} else {
		_.pull(formUserObject.friends, toUsername)
		_.pull(toUserObject, fromUsername)
	}

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

async function getPendingInvitations(username, queryField, searchField) {
	const pendingInvitations = PendingInvitationsModel.find({[queryField]:username}, searchField).exec()
	return await pendingInvitations
}

module.exports = Friends