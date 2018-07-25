//GENERIC DEPENDENCIES
require('./chatpage.css')
const React = require('react')
const {Redirect, Link} = require('react-router-dom')
const _ = require('lodash')
const { connect } = require('react-redux')

//LOGIC DEPENDENCIES
const protocols = require('../../utils/io-protocol.json')
const HOMEPAGE_PATH = require('../../routes/routes').paths.HOME
const webSocketProvider = require('../../utils/sockets/ws-routing')

//COMPONENTS
const ConnectStatus = require('./components/connectStatus/connectStatus')
const ChatWindow = require('./components/chatWindow/chatWindow')
const SidePanel = require('../../components/sidePanel/sidePanel')
const RoomMembersList = require('./components/roomMembersList/roomMembersList')
const UserFinder = require('./components/userFinder/userFinder')
const MiniProfile = require('./components/miniProfile/miniProfile')
const RoomsDialer = require('./components/roomsDialer/roomsDialer')
const RoomJoiner = require('./components/roomJoiner/roomJoiner')
const SIDE_PANEL_DIRECTIONS = require('../../components/sidePanel/sidePanelDirections')

//ACTIONS
const roomActions = require('../../services/roomsManagement/room.actions')
const roomsManagementActions = require('../../services/roomsManagement/roomsManagement.actions')

let socket

function mapStateToProps(state) {
	return {
		room: state.roomsManagementReducer.rooms[state.roomsManagementReducer.selectedRoom],
		joinedRooms: Object.keys(state.roomsManagementReducer.rooms),
		username: state.sessionReducer.username
	}
}

function mapDispatchToProps(dispatch) {
	return {
		setMembers: (usernames, roomId) => dispatch(roomActions.actions.setMembers(usernames, roomId)),
		addRoomMember: (username, roomId) => dispatch(roomActions.actions.addMember(username, roomId)),
		addMessage: (message, roomId) => dispatch(roomActions.actions.addMessage(message, roomId)),
		sendMessage: (message, roomId) => dispatch(roomActions.actions.sendMessage(message, roomId)),
		selectRoom: roomId => dispatch(roomsManagementActions.actions.selectRoom(roomId))
	}
}

class ChatPage extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			input: '',
			selectedRoom: '',
			usersFound: [],
			namespacesConnectionStatus: {
				users: false,
				room: false
			},
			userToFind: ''
		}
		this.sendMessage = this.sendMessage.bind(this)
		this.setUsersNamespaceAsConnected = this.setUsersNamespaceAsConnected.bind(this)
		this.setRoomNamespaceAsConnected = this.setRoomNamespaceAsConnected.bind(this)
		this.addMessageToStore = this.addMessageToStore.bind(this)
		this.handleJoinEvent = this.handleJoinEvent.bind(this)
		this.joinToRoom = this.joinToRoom.bind(this)
		this.findUserByUsername = this.findUserByUsername.bind(this)
		this.setRoomMembers = this.setRoomMembers.bind(this)
		this.createRoom = this.createRoom.bind(this)
		this.changeSelectedRoom = this.changeSelectedRoom.bind(this)
	}

	componentDidMount() {
		socket = webSocketProvider.get()

		socket.room.on(protocols.CONNECTION, this.setRoomNamespaceAsConnected)
		socket.room.on(protocols.MESSAGE, this.addMessageToStore)
		socket.room.on(protocols.JOIN, this.handleJoinEvent)
		socket.room.on(protocols.LIST_MEMBERS, this.setRoomMembers)

		socket.users.on(protocols.CONNECTION, this.setUsersNamespaceAsConnected)
		socket.users.on(protocols.FIND, this.updateFoundUsers.bind(this))
	}

	joinToRoom(roomId) {
		socket.room.emit(protocols.JOIN, {roomId})
	}

	isConnected() {
		return this.state.namespacesConnectionStatus.room && this.state.namespacesConnectionStatus.users
	}

	setRoomNamespaceAsConnected() {
		this.setState({namespacesConnectionStatus: {room: true, users: this.state.namespacesConnectionStatus.users}})
	}

	setUsersNamespaceAsConnected() {
		this.setState({namespacesConnectionStatus: {users: true, room: this.state.namespacesConnectionStatus.room}})
	}

	addMessageToStore(data) {
		this.props.addMessage(data, data.roomId)
	}

	setRoomMembers(data) {
		this.props.setMembers(data.usernames, this.state.selectedRoom)
	}

	findUserByUsername(username) {
		this.setState({userToFind: username})
		socket.users.emit(protocols.FIND, {queryPhrase: username})
	}

	handleJoinEvent(data) {
		this.props.addRoomMember(data.username, data.roomId)
		if (data.username !== this.props.username) return
		this.changeSelectedRoom(data)
	}

	updateFoundUsers(data) {
		const {foundUsernames} = data
		this.setState({usersFound: foundUsernames})
	}

	changeSelectedRoom(roomDetails) {
		const {roomId} = roomDetails
		this.setState({selectedRoom: roomId})
		this.props.selectRoom(roomId)
	}

	sendMessage(text) {
		const newMessage = {
			roomId: this.state.selectedRoom,
			message: text,
			timestamp: new Date().getTime(),
			username: this.props.username
		}
		this.props.sendMessage(newMessage, newMessage.roomId)
	}

	createRoom(usernamesToInvite) {
		socket.room.emit(protocols.CREATE, {invitedUsersIndexes: usernamesToInvite})
	}

	render() {
		if(!this.props.username) return <Redirect to={HOMEPAGE_PATH}/>
		console.log(this.props.joinedRooms)
		return (
			<div className='container-fluid h-100-vh my-chat-page'>
				<div className='row h-100'>
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.LEFT}>
						<MiniProfile username={this.props.username} />
						<RoomJoiner joinRoom={this.joinToRoom} />
						<RoomsDialer rooms={this.props.joinedRooms} selectRoom={this.changeSelectedRoom} />
					</SidePanel>
					{
						this.props.room ?
							<ChatWindow messages={this.props.room.messages} sendMessage={this.sendMessage}/> :
							<div className='col-md-6 h-100-vh d-flex flex-column'></div>
					}
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.RIGHT}>
						<h4>Room: {this.state.selectedRoom ? this.state.selectedRoom : 'none'}</h4>
						{this.props.room ? <RoomMembersList usernames={this.props.room.members}/> : <div></div>}
						<ConnectStatus connection={this.isConnected()}/>
						<UserFinder foundUsers={this.state.usersFound} createRoom={this.createRoom} findUser={this.findUserByUsername}/>
						<Link className='btn btn-danger' to={HOMEPAGE_PATH}>Logout</Link>
					</SidePanel>
				</div>
			</div>
		)
	}
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ChatPage)