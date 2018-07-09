const React = require('react')
const {Redirect, Link} = require('react-router-dom')
const _ = require('lodash')
const ConnectStatus = require('../../components/connectStatus')
const Room = require('../../components/room')
let socket
const protocols = require('../../utils/io-protocol')
const HOMEPAGE_PATH = require('../../routes/routes').paths.HOME
const USERNAMES_PLACEHOLDER = ''
const dummyAvatar = require('../../theme/assets/avatar.svg')
const ChatWindow = require('./components/chatWindow/chatWindow')
const SidePanel = require('../../components/sidePanel/sidePanel')
const RoomMembersList = require('./components/roomMembersList/roomMembersList')
const UserFinder = require('./components/userFinder/userFinder')
const SIDE_PANEL_DIRECTIONS = require('../../components/sidePanel/sidePanelDirections')
require('./chatpage.css')

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
			roomToJoin: '',
			usersFound: [],
			usersInRoom: []
		}
		this.sendMessage = this.sendMessage.bind(this)
		this.handleConnectionEvent = this.handleConnectionEvent.bind(this)
		this.handleMessageEvent = this.handleMessageEvent.bind(this)
		this.handleJoinEvent = this.handleJoinEvent.bind(this)
		this.handleRoomJoin = this.handleRoomJoin.bind(this)
		this.handleRoomToChangeUserInput = this.handleRoomToChangeUserInput.bind(this)
		this.findUserByUsername = this.findUserByUsername.bind(this)
		this.handleListMembersEvent = this.handleListMembersEvent.bind(this)
		this.createRoom = this.createRoom.bind(this)
	}

	componentDidMount() {
		socket = require('../../utils/sockets/ws-routing')()
		socket.room.on(protocols.CONNECTION, this.handleConnectionEvent)
		socket.room.on(protocols.MESSAGE, this.handleMessageEvent)
		socket.room.on(protocols.JOIN, this.handleJoinEvent)
		socket.room.on(protocols.LIST_MEMBERS, this.handleListMembersEvent)
		socket.users.on(protocols.FIND, this.updateFoundUsers.bind(this))
	}

	handleRoomJoin() {
		socket.room.emit(protocols.JOIN, {roomId: this.state.roomToJoin})
	}

	handleConnectionEvent() {
		this.setState({connected: true})
	}

	handleMessageEvent(data) {
		this.updateMessageState(data)
	}

	handleListMembersEvent(data) {
		this.setState({usersInRoom: data.usernames})
	}

	handleRoomToChangeUserInput(event) {
		this.setState({roomToJoin: event.target.value})
	}

	findUserByUsername(username) {
		this.setState({userToFind: username})
		socket.users.emit(protocols.FIND, {queryPhrase: username})
	}

	handleJoinEvent(data) {
		if (data.username !== this.state.username) return
		this.updateJoinedRooms(data)
		this.changeSelectedRoom(data)
	}

	updateFoundUsers(data) {
		const {foundUsernames} = data
		this.setState({usersFound: foundUsernames})
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
		if(roomId === this.state.selectedRoom) {
			this.setState({messages: JSON.parse(window.sessionStorage.getItem(roomId))}, this.generateMessages)
		}
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

	generateFoundUsers() {
		return this.state.usersFound.map((username, key) => 
			<li key={key} className='message list-group-item' onUserClick={() => this.createRoom([username])}>{username}</li>)
	}

	generateMessages() {
		if(!this.state.selectedRoom) return <h6>Please join a room before attempting to load messages</h6>
		if(_.isEmpty(this.state.messages)) return
		return this.state.messages.map((msg, i) => 
			msg.username === this.state.username ?
				<li className='message list-group-item' key={i}>
					<p>
						<span className='font-weight-bold'>{msg.username}</span></p>
					<p>
						<span>{msg.message}</span>
						<span className='text-muted float-right'>{new Date(msg.timestamp).toLocaleTimeString()}</span>
					</p>
				</li>
				:
				<li className='message list-group-item' key={i}>
					<p className='mb-5'>
						<span className='font-weight-bold float-right'>{msg.username}</span></p>
					<p>
						<span className='float-right'>{msg.message}</span>
						<span className='text-muted'>{new Date(msg.timestamp).toLocaleTimeString()}</span>
					</p>
				</li>
		)
	}

	generateRooms() {
		if(_.isEmpty(this.state.userRooms)) return
		return this.state.userRooms.map(
			(room, roomIndex) => 
				<Room 
					key={roomIndex}
					name={`Room #${room.roomId}`}
					ID={room.roomId}
					onClick={() => this.changeSelectedRoom({roomId: room.roomId})}
				/>
		)
	}

	sendMessage(text) {
		if(!_.isEmpty(text) && this.state.selectedRoom) {
			const roomId =  this.state.selectedRoom
			const message = text
			const timestamp = new Date().getTime()
			const username = this.state.username
			socket.room.emit(protocols.MESSAGE, {roomId, message})
			this.storeMessage(roomId, {roomId, message, timestamp, username})
			return
		}
		throw new Error('No room selected || input field is empty.')
	}

	createRoom(usernamesToInvite) {
		socket.room.emit(protocols.CREATE, {invitedUsersIndexes: usernamesToInvite})
	}

	render() {
		if(!this.state.username) return <Redirect to={HOMEPAGE_PATH}/>
		
		return (
			<div className='container-fluid h-100 my-chat-page'>
				<div className='row h-100'>
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.LEFT}>
						<div className='card'>
							<img className='card-img-top' src={dummyAvatar}></img>
							<div className='card-body'>
								<h2 className='card-title'>{this.state.username.toUpperCase()}</h2>
								<h6 className='card-subtitle mb-2 text-muted'>No description</h6>
							</div>
						</div>
						<div>
							<input className='form-control' palceholder='Room name' value={this.state.roomToJoin} onChange={this.handleRoomToChangeUserInput}/>
						</div>
						<button className='btn btn-primary' onClick={this.handleRoomJoin}> Join Room </button>
						<ul className='list-group room-ID-list'>
							<h1>Choose a room</h1>
							{this.generateRooms()}
						</ul>
					</SidePanel>
					<div className='col-md-6 h-100 d-flex flex-column-reverse'>
						<ChatWindow messages={this.state.messages} sendMessage={this.sendMessage}/>
					</div>
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.RIGHT}>
						<h4>Room Information/Etc </h4>
						<ConnectStatus connection={this.state.connected}/>
						<RoomMembersList usernames={this.state.usersInRoom} roomName={this.state.selectedRoom}/>
						<UserFinder foundUsers={this.state.usersFound} createRoom={this.createRoom} findUser={this.findUserByUsername}/>
						<Link className='btn btn-danger' to={HOMEPAGE_PATH}>Logout</Link>
					</SidePanel>
				</div>
			</div>
		)
	}
}

module.exports = ChatPage