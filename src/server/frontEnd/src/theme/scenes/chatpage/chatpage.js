//GENERIC DEPENDENCIES
require('./chatpage.css')
const React = require('react')
const {Redirect, Link} = require('react-router-dom')
const _ = require('lodash')
const { connect } = require('react-redux')

//LOGIC DEPENDENCIES
const HOMEPAGE_PATH = require('routing-config').paths.HOME

//COMPONENTS
const ConnectStatus = require('./components/connectStatus/connectStatus')
const ChatWindow = require('./components/chatWindow/chatWindow')
const SidePanel = require('theme/components/sidePanel/sidePanel')
const RoomMembersList = require('./components/roomMembersList/roomMembersList')
const UserFinder = require('./components/userFinder/userFinder')
const Avatar = require('theme/components/avatar/avatar')
const AVATAR_SIZES = require('theme/components/avatar/avatarSizes')
const RoomsDialer = require('./components/roomsDialer/roomsDialer')
const RoomJoiner = require('./components/roomJoiner/roomJoiner')
const SIDE_PANEL_DIRECTIONS = require('theme/components/sidePanel/sidePanelDirections')

//ACTIONS
const roomActions = require('services/roomsManagement/room.actions')
const roomsManagementActions = require('services/roomsManagement/roomsManagement.actions')
const sessionActions = require('services/session/session.actions')
const findUsersActions = require('services/findUsers/findUsers.actions')


function mapStateToProps(state) {
	return {
		rooms: state.roomsManagementReducer.rooms,
		joinedRooms: Object.keys(state.roomsManagementReducer.rooms),
		username: state.sessionReducer.username,
		isWebSocketRoomConenctionEstabilished: state.sessionReducer.isConnectedToRoom,
		isWebSocketUsersConenctionEstabilished: state.sessionReducer.isConnectedToUsers,
		usersFound: state.findUsersReducer.usersFound,
		selectedRoom: state.roomsManagementReducer.selectedRoom
	}
}

function mapDispatchToProps(dispatch) {
	return {
		sendMessage: message => dispatch(roomActions.actions.sendMessage(message)),
		selectRoom: roomId => dispatch(roomsManagementActions.actions.selectRoom(roomId)),
		joinRoom: roomId => dispatch(roomsManagementActions.actions.joinRoom(roomId)),
		createRoom: invitedUsers => dispatch(roomsManagementActions.actions.createRoom(invitedUsers)),
		logOut: () => dispatch(sessionActions.actions.logOut()),
		findUsersByUsername: username => dispatch(findUsersActions.actions.findUser(username)),
		leaveRoom: roomId => dispatch(roomsManagementActions.actions.leaveRoom(roomId))
	}
}

class ChatPage extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			input: '',
			namespacesConnectionStatus: {
				users: false,
				room: false
			}
		}
		this.sendMessage = this.sendMessage.bind(this)
		this.setUsersNamespaceAsConnected = this.setUsersNamespaceAsConnected.bind(this)
		this.setRoomNamespaceAsConnected = this.setRoomNamespaceAsConnected.bind(this)
		this.joinToRoom = this.joinToRoom.bind(this)
		this.createRoom = this.createRoom.bind(this)
		this.changeSelectedRoom = this.changeSelectedRoom.bind(this)
	}

	getSelectedRoom() {
		return this.props.rooms[this.props.selectedRoom]
	}

	joinToRoom(roomId) {
		const isRoomAlreadyJoined = _.includes(Object.keys(this.props.rooms), roomId) 
		if (isRoomAlreadyJoined) return
		this.props.joinRoom(roomId)
		this.changeSelectedRoom({roomId})
	}

	createRoom(usernamesToInvite) {
		this.props.createRoom(usernamesToInvite)
	}

	isConnected() {
		return this.props.isWebSocketRoomConenctionEstabilished && this.props.isWebSocketUsersConenctionEstabilished
	}

	setRoomNamespaceAsConnected() {
		this.setState({namespacesConnectionStatus: {room: true, users: this.state.namespacesConnectionStatus.users}})
	}

	setUsersNamespaceAsConnected() {
		this.setState({namespacesConnectionStatus: {users: true, room: this.state.namespacesConnectionStatus.room}})
	}

	changeSelectedRoom(roomDetails) {
		const {roomId} = roomDetails
		this.props.selectRoom(roomId)
	}

	sendMessage(text) {
		const newMessage = {
			roomId: this.props.selectedRoom,
			message: text,
			username: this.props.username
		}
		this.props.sendMessage(newMessage)
	}

	render() {
		if(!this.props.username) return <Redirect to={HOMEPAGE_PATH}/>
		return (
			<div id='chatpage' className='h-full'>
				<div className='flex flex-row h-full'>
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.LEFT} color='dark'>
						<Avatar size={AVATAR_SIZES.BIG} username={this.props.username} />
						<RoomJoiner joinRoom={this.joinToRoom} />
						<RoomsDialer rooms={this.props.joinedRooms} selectRoom={this.changeSelectedRoom} leaveRoom={this.props.leaveRoom}/>
					</SidePanel>
					{
						this.getSelectedRoom() ?
							<ChatWindow messages={this.getSelectedRoom().messages} sendMessage={this.sendMessage}/> :
							<div className='w-full'></div>
					}
					<SidePanel direction={SIDE_PANEL_DIRECTIONS.RIGHT} color='dark'>
						<h4>Room: {this.props.selectedRoom ? this.props.selectedRoom : 'none'}</h4>
						{this.getSelectedRoom() ? <RoomMembersList usernames={this.getSelectedRoom().members}/> : <div></div>}
						<ConnectStatus connection={this.isConnected()}/>
						<UserFinder data-test='user-finder' foundUsers={this.props.usersFound} createRoom={this.createRoom} findUser={this.props.findUsersByUsername}/>
						<Link className='btn btn-danger' onClick={this.props.logOut} to={HOMEPAGE_PATH} >Logout</Link>
					</SidePanel>
				</div>
			</div>
		)
	}
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ChatPage)