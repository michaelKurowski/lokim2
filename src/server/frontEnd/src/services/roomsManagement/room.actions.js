const _ = require('lodash')

const CODES = {
	ADD_MESSAGE: 'ADD_MESSAGE',
	ADD_MEMBER: 'ADD_MEMBER',
	SEND_MESSAGE: 'SEND_MESSAGE',
	SET_MEMBERS: 'SET_MEMBERS',
	INCORRECT_MESSAGE: 'INCORRECT_MESSAGE',
	REMOVE_MEMBER: 'REMOVE_MEMBER'
}
const actions = {
	addMessage,
	setMembers,
	addMember,
	sendMessage,
	removeMember
}

function addMember(username, roomId) {
	return {type: CODES.ADD_MEMBER, payload: {username, roomId}}
}

function removeMember(username, roomId) {
	return {type: CODES.REMOVE_MEMBER, payload: {username, roomId}}
}

function setMembers(members, roomId) {
	return {type: CODES.SET_MEMBERS, payload: {members, roomId}}
}

function addMessage(messageObject, roomId) {
	if (_.isEmpty(messageObject.payload.text) || !roomId) return {type: CODES.INCORRECT_MESSAGE, payload: {message: messageObject, roomId}}
	return {type: CODES.ADD_MESSAGE, payload: {message: messageObject, roomId}}
}

function sendMessage(messageObject) {
	return {type: CODES.SEND_MESSAGE, payload: {messageObject}}
}

module.exports = {CODES, actions}