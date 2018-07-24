const React = require('react')
const {Redirect, Link} = require('react-router-dom')
const _ = require('lodash')
const ConnectStatus = require('./components/connectStatus/connectStatus')
let socket
const protocols = require('../../utils/io-protocol.json')
const HOMEPAGE_PATH = require('../../routes/routes').paths.HOME
const ChatWindow = require('./components/chatWindow/chatWindow')
const SidePanel = require('../../components/sidePanel/sidePanel')
const RoomMembersList = require('./components/roomMembersList/roomMembersList')
const UserFinder = require('./components/userFinder/userFinder')
const MiniProfile = require('./components/miniProfile/miniProfile')
const RoomsDialer = require('./components/roomsDialer/roomsDialer')
const RoomJoiner = require('./components/roomJoiner/roomJoiner')
const SIDE_PANEL_DIRECTIONS = require('../../components/sidePanel/sidePanelDirections')
const roomActions = require('../../services/room/room.actions')
const { connect } = require('react-redux')
require('./chatpage.css')


function mapStateToProps(state) {
	return {
		messagesA: state.roomReducer.messages,
		membersA: state.roomReducer.members,
		username: state.sessionReducer.username
	}
}

function mapDispatchToProps(dispatch) {
	return {
		handleJoinEventA: data => dispatch(roomActions.actions.addMember(data.username))
	}
}

class ChatPage extends React.Component {
	constructor(props) {
		super(props)
		const initProps = this.props.location.state
		this.state = {
			input: '',
			messages: [],
			selectedRoom: '',
			//username: _.get(initProps, 'username', null),
			userRooms: [],
			roomToJoin: '',
			usersFound: [],
			usersInRoom: [],
			namespacesConnectionStatus: {
				users: false,
				room: false
			}
		}
		this.sendMessage = this.sendMessage.bind(this)
		this.handleUsersConnectionEvent = this.handleUsersConnectionEvent.bind(this)
		this.handleRoomConnectionEvent = this.handleRoomConnectionEvent.bind(this)
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
		socket.room.on(protocols.CONNECTION, this.handleRoomConnectionEvent)
		socket.users.on(protocols.CONNECTION, this.handleUsersConnectionEvent)
		socket.room.on(protocols.MESSAGE, this.handleMessageEvent)
		socket.room.on(protocols.JOIN, this.handleJoinEvent)
		socket.room.on(protocols.LIST_MEMBERS, this.handleListMembersEvent)
		socket.users.on(protocols.FIND, this.updateFoundUsers.bind(this))
		

	}

	handleRoomJoin(roomId) {
		socket.room.emit(protocols.JOIN, {roomId})
	}

	isConnected() {
		console.log(this.state)
		return this.state.namespacesConnectionStatus.room && this.state.namespacesConnectionStatus.users
	}

	handleRoomConnectionEvent() {
		console.log('room')
		this.setState({namespacesConnectionStatus: {room: true, users: this.state.namespacesConnectionStatus.users}})
	}

	handleUsersConnectionEvent() {
		console.log('users')
		this.setState({namespacesConnectionStatus: {users: true, room: this.state.namespacesConnectionStatus.room}})
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
		if (data.username !== this.props.username) return
		this.updateJoinedRooms(data)
		this.changeSelectedRoom(data)
		this.props.handleJoinEventA(data)
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

	sendMessage(text) {
		if (_.isEmpty(text) || !this.state.selectedRoom) {
			alert('No error selected')
			console.warn(new Error(`No room selected || input field is empty. Text: ${text}, selected room: ${this.state.selectedRoom}`))
			return
		}

		const newMessage = {
			roomId: this.state.selectedRoom,
			message: text,
			timestamp: new Date().getTime(),
			username: this.props.username
		}

		socket.room.emit(protocols.MESSAGE, {roomId: newMessage.roomId, message: newMessage.message})
		this.storeMessage(newMessage.roomId, newMessage)
	}

	createRoom(usernamesToInvite) {
		socket.room.emit(protocols.CREATE, {invitedUsersIndexes: usernamesToInvite})
	}

	render() {
		if(!this.props.username) return <Redirect to={HOMEPAGE_PATH}/>
		return (
			<div className='container-fluid h-100-vh my-chat-page'>
				<div className='row h-100'>
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.LEFT}>
						<MiniProfile username={this.props.username} />
						<RoomJoiner joinRoom={this.handleRoomJoin} />
						<RoomsDialer rooms={this.state.userRooms} selectRoom={this.changeSelectedRoom} />
					</SidePanel>
					<ChatWindow messages={this.state.messages} sendMessage={this.sendMessage}/>
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.RIGHT}>
						<h4>Room Information/Etc </h4>
						<ConnectStatus connection={this.isConnected()}/>
						<RoomMembersList usernames={this.state.usersInRoom} roomName={this.state.selectedRoom}/>
						<UserFinder foundUsers={this.state.usersFound} createRoom={this.createRoom} findUser={this.findUserByUsername}/>
						<Link className='btn btn-danger' to={HOMEPAGE_PATH}>Logout</Link>
					</SidePanel>
				</div>
			</div>
		)
	}
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ChatPage)