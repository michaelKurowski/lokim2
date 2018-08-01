const React = require('react')
const UsersList = require('../usersList/usersList')
const _ = require('lodash')
class RoomMembersList extends React.Component {
	constructor() {
		super()
	}
	render() {
		return (
			<div>
				<h6>Users in current room:</h6>
				<UsersList usernames={this.props.usernames} />
			</div>
		)
	}
}
module.exports = RoomMembersList