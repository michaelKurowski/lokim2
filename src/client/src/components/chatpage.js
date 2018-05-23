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
			userRooms: new Map()
		}

		this.handleUserInput = this.handleUserInput.bind(this)
		this.sendMessage = this.sendMessage.bind(this)
		this.handleConnectionEvent = this.handleConnectionEvent.bind(this)
		this.handleMessageEvent = this.handleMessageEvent.bind(this)
		this.handleJoinEvent = this.handleJoinEvent.bind(this)
		this.handleListUsers = this.handleListUsers.bind(this)
		this.changeSelectedRoom = this.changeSelectedRoom.bind(this)
	}
	componentDidMount() {
		socket.on(protocols.CONNECTION, this.handleConnectionEvent)
		socket.on(protocols.MESSAGE, this.handleMessageEvent)
		socket.on(protocols.JOIN, this.handleJoinEvent)
		socket.on(protocols.LIST_MEMBERS, this.handleListUsers)
		socket.emit(protocols.JOIN, {roomId: 'e4882ee7-689c-426a-bc44-2dee05695013'})
	}
	handleConnectionEvent() {
		this.setState({connected: true})
	}
	handleMessageEvent(data) {
		this.updateMessageState(data)
	}
	handleJoinEvent(data) {
		this.updateJoinedRooms(data)
	}
	handleListUsers(data){
		console.log('List users', data)
		const {roomId, usernames} = data
		console.log(usernames)
		this.setState({userRooms: this.state.userRooms.set(roomId, usernames)})
	}
	updateJoinedRooms(data) {
		const {roomId} = data
		const usernames = data.username
		console.log('Link to LIST OF USERS')
		this.setState({userRooms: this.state.userRooms.set(roomId, usernames)})
	}
	changeSelectedRoom(roomId) {
		socket.emit(protocols.LIST_MEMBERS, {roomId: this.state.selectedRoom})
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
		const usernames = this.state.userRooms.get(roomId)
		console.log('Find Users:', roomId, usernames)
		return usernames || 'None'
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

		let rooms = []
		for(let key of this.state.userRooms.keys()){
			rooms.push(<Room
							key={key}
							name={`Room #${rooms.length + 1}`}
							ID={key}
							onClick={() => this.changeSelectedRoom(key)}
					/>
				)
		}
		console.log(rooms)
		return rooms
		// return this.state.userRooms.map(
		// 	(e, i) => 
		// 		<Room 
		// 			key={i}
		// 			name={`Room #${i}`}
		// 			ID={e.roomId}
		// 			onClick={() => this.changeSelectedRoom(e.roomId)}
		// 		/>
		// )
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
		
		return(
			<div className='container-fluid'>
				<div className='row'>
					<div className='sidebar col-md-3'>
						<h2>User: {this.state.username.toUpperCase()}</h2>
						<ul className='list-group room-ID-list'>
							<p>Click The Pinkness for Room Selection</p>
							{this.generateRooms()}
						</ul>
						<h4>Create a Room: </h4>
						<input type="text" placeholder="Users to invite"/>
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