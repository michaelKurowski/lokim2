const React = require('react')
const {Redirect, Link} = require('react-router-dom')
const _ = require('lodash')
const ConnectStatus = require('./connectStatus')
const Room = require('./room')
const socket = require('../utils/sockets/ws-routing')
const protocols = require('../utils/io-protocol')
const HOMEPAGE_PATH = require('../routes/routes').paths.HOME
const USERNAMES_PLACEHOLDER = ''


class ChatPage extends React.Component {
	constructor(props) {
		super(props)
		const initProps = this.props.location.state
		this.state = {
			connected: false,
			input: '',
			messages: [],
			selectedRoom: '',
			username: _.get(initProps, 'username', null),
			userRooms: [],
			roomToJoin: ''
		}

		this.handleUserInput = this.handleUserInput.bind(this)
		this.sendMessage = this.sendMessage.bind(this)
		this.handleConnectionEvent = this.handleConnectionEvent.bind(this)
		this.handleMessageEvent = this.handleMessageEvent.bind(this)
		this.handleJoinEvent = this.handleJoinEvent.bind(this)
		this.handleRoomJoin = this.handleRoomJoin.bind(this)
		this.handleRoomToChangeUserInput = this.handleRoomToChangeUserInput.bind(this)
	}

	componentDidMount() {
		socket.on(protocols.CONNECTION, this.handleConnectionEvent)
		socket.on(protocols.MESSAGE, this.handleMessageEvent)
		socket.on(protocols.JOIN, this.handleJoinEvent)
	}

	handleRoomJoin() {
		socket.emit(protocols.JOIN, {roomId: this.state.roomToJoin})
	}

	handleConnectionEvent() {
		this.setState({connected: true})
	}

	handleMessageEvent(data) {
		this.updateMessageState(data)
	}

	handleRoomToChangeUserInput(event) {
		this.setState({roomToJoin: event.target.value})
	}

	handleJoinEvent(data) {
		console.log('JOIN', data)
		this.updateJoinedRooms(data)
		this.changeSelectedRoom(data)
	}

	updateJoinedRooms(data) {
		const {roomId} = data
		const usernames = data.username
		this.setState({userRooms: this.state.userRooms.concat({roomId, usernames})})
	}

	changeSelectedRoom(roomDetails) {
		const {roomId} = roomDetails
		this.setState({selectedRoom: roomId}, () =>  this.updateMessageState({roomId}))
	}

	storeMessage(roomId, newMessage) {
		const store = window.sessionStorage
		const roomMessages = store.getItem(roomId) ? JSON.parse(store.getItem(roomId)) : []
		const updatedRoomMessages = _.concat(roomMessages, newMessage)
		store.setItem(roomId, JSON.stringify(updatedRoomMessages))
	}

	updateMessageState(messageData) {
		const {roomId, username, message, timestamp} = messageData

		if(!_.isEmpty(message)) {
			this.storeMessage(roomId, {username, message, timestamp})
		}
		if(roomId === this.state.selectedRoom) {
			this.setState({messages: JSON.parse(window.sessionStorage.getItem(roomId))}, this.generateMessages)
		}
	}

	findUsersOfRoom(roomId) {
		const roomObject = this.state.userRooms.find(room => room.roomId === roomId)
		return _.get(roomObject, 'usernames', USERNAMES_PLACEHOLDER)
	}

	generateMessages() {
		if(!this.state.selectedRoom) return <h6>Please join a room before attempting to load messages</h6>
		if(_.isEmpty(this.state.messages)) return
		return this.state.messages.map((msg, i) => 
			<li className='message' key={i}>
				{`${msg.username}:\t ${msg.message} \t ${msg.timestamp}`}
			</li>
		)
	}

	generateRooms() {
		if(_.isEmpty(this.state.userRooms)) return
		console.log(this.state.userRooms)
		return this.state.userRooms.map(
			(e, i) => 
				<Room 
					key={i}
					name={`Room #${e.roomId}`}
					ID={e.roomId}
					onClick={this.changeSelectedRoom}
				/>
		)
	}

	handleUserInput(event) {
		this.setState({input: event.target.value})
	}

	sendMessage() {
		if(!_.isEmpty(this.state.input) && this.state.selectedRoom) {
			const roomId =  this.state.selectedRoom
			const message = this.state.input
			socket.emit(protocols.MESSAGE, {roomId, message})

			const localMessage = {roomId, username: this.state.username, message, timestamp: new Date().getTime()}
			return this.updateMessageState(localMessage)
		}
		throw new Error('No room selected || input field is empty.')
	}

	render() {
		/* istanbul ignore next */
		if(!this.state.username) return <Redirect to={HOMEPAGE_PATH}/>
		
		return (
			<div className='container-fluid'>
				<div className='row'>
					<div className='sidebar col-md-3'>
						<h2>User: {this.state.username.toUpperCase()}</h2>
						<input palceholder='Room name' value={this.state.roomToJoin} onChange={this.handleRoomToChangeUserInput}/>
						<button onClick={this.handleRoomJoin}> Join Room </button>
						<ul className='list-group room-ID-list'>
							<p>Click The Pinkness for Room Selection</p>
							{this.generateRooms()}
						</ul>
					</div>
					<div className='col-md-6'>
						<div className='message-area'>
							<ul>
								{this.generateMessages()}
							</ul>
						</div>
						<input className='form-control' placeholder='Message...' value={this.state.input} onChange={this.handleUserInput}/>
						<button className='btn btn-primary' onClick={this.sendMessage}>Send</button>
					</div>
					<div className='col-md-3'>
						<h4>Room Information/Etc </h4>
						<ConnectStatus connection={this.state.connected}/>
						<h6>Current Room: {this.state.selectedRoom}</h6>
						<h6>Users in current room: {this.findUsersOfRoom(this.state.selectedRoom)}</h6>
						<Link className='btn btn-danger' to={HOMEPAGE_PATH}>Logout</Link>
					</div>
				</div>
			</div>
		)
	}
}

module.exports = ChatPage