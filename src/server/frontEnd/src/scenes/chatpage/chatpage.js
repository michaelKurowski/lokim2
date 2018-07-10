const React = require('react')
const {Redirect, Link} = require('react-router-dom')
const _ = require('lodash')
const ConnectStatus = require('../../components/connectStatus')
const Room = require('../../components/room')
let socket
const protocols = require('../../utils/io-protocol')
const HOMEPAGE_PATH = require('../../routes/routes').paths.HOME
const USERNAMES_PLACEHOLDER = ''
const ChatWindow = require('./components/chatWindow/chatWindow')
const SidePanel = require('../../components/sidePanel/sidePanel')
const RoomMembersList = require('./components/roomMembersList/roomMembersList')
const UserFinder = require('./components/userFinder/userFinder')
const MiniProfile = require('./components/miniProfile/miniProfile')
const RoomsDialer = require('./components/roomsDialer/roomsDialer')
const RoomJoiner = require('./components/roomJoiner/roomJoiner')
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
		this.changeSelectedRoom = this.changeSelectedRoom.bind(this)
	}

	componentDidMount() {
		socket = require('../../utils/sockets/ws-routing')()
		socket.room.on(protocols.CONNECTION, this.handleConnectionEvent)
		socket.room.on(protocols.MESSAGE, this.handleMessageEvent)
		socket.room.on(protocols.JOIN, this.handleJoinEvent)
		socket.room.on(protocols.LIST_MEMBERS, this.handleListMembersEvent)
		socket.users.on(protocols.FIND, this.updateFoundUsers.bind(this))
	}

	handleRoomJoin(roomId) {
		socket.room.emit(protocols.JOIN, {roomId})
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
			this.setState({messages: JSON.parse(window.sessionStorage.getItem(roomId))})
		}
	}

	updateMessageState(messageData) {
		const {roomId, username, message, timestamp} = messageData

		if(!_.isEmpty(message)) {
			this.storeMessage(roomId, {username, message, timestamp})
		}
		if(roomId === this.state.selectedRoom) {
			this.setState({messages: JSON.parse(window.sessionStorage.getItem(roomId))})
		}
	}

	findUsersOfRoom(roomId) {
		const roomObject = this.state.userRooms.find(room => room.roomId === roomId)
		return _.get(roomObject, 'usernames', USERNAMES_PLACEHOLDER)
	}

	sendMessage(text) {
		if (_.isEmpty(text) || !this.state.selectedRoom)
			throw new Error(`No room selected || input field is empty. Text: ${text}, selected room: ${this.state.selectedRoom}`)

		const newMessage = {
			roomId: this.state.selectedRoom,
			message: text,
			timestamp: new Date().getTime(),
			username: this.state.username
		}

		socket.room.emit(protocols.MESSAGE, {roomId: newMessage.roomId, message: newMessage.message})
		this.storeMessage(newMessage.roomId, newMessage)
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
						<MiniProfile username={this.state.username} />
						<RoomJoiner joinRoom={this.handleRoomJoin} />
						<RoomsDialer rooms={this.state.userRooms} selectRoom={this.changeSelectedRoom} />
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