const React = require('react')
const UsersListElement = require('../usersListElement/usersListElement')
const _ = require('lodash')
class RoomMembersList extends React.Component {
	constructor() {
		super()
	}
	render() {
		return (
			<div>
				<h6>Current Room: {this.props.roomName}</h6>
				<h6>Users in current room:</h6>
				<ul>
					{this.props.usernames.map(username => <UsersListElement username={username} key={username} onClick={_.noop}/>)}
				</ul>
			</div>
		)
	}
}
module.exports = RoomMembersList