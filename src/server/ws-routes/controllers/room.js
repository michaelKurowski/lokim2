const UserModel = require('../../models/user')
const uuidv1 = require('uuid/v1')
const namespaces = require('../../protocol/webSocketNamespaces')
const _ = require('lodash')
const NAMESPACE_NAME = 'room'

const namespace = _.find(namespaces, namespace => namespace.name === 'NAMESPACE_NAME')

function get(data, socket) {
	/*UserModel.findOne().exec()
		.then(user => {})
		.catch()*/
	console.log(data, socket)
	socket.emit('dupa', 'lol')
}

function join(data, socket) {
}

function message(data, socket) {
	console.log('receivedMessage', data)
	console.log(Object.keys(socket.rooms))
	//socket.broadcast.to(id)
}

function leave() {

}

function create({members}, socket) {
	const roomId = uuidv1()
	console.log(roomId)
	socket.emit('get', roomId)
	socket.join(roomId)
}

function list(data, socket) {
	const namespace = socket.nsp
	namespace.clients((error, clients) => {
		console.log('CLIENTS', clients)
	})
}

function connection(socket) {
	const userId = 'AAAA'
	console.log('connection')
	socket.join(userId)
}

module.exports = {join, message, leave, create, list, connection}