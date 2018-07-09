const React = require('react')
const RoomMember = require('./roomMember/roomMember')
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
					{this.props.usernames.map(username => <RoomMember username={username} key={username}/>)}
				</ul>
			</div>
		)
	}
}
module.exports = RoomMembersList