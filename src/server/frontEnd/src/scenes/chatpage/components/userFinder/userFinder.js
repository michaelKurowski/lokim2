const React = require('react')
const UsersList = require('../usersList/usersList')
const UserFinderInput = require('./userFinderInput/userFinderInput')
class UserFinder extends React.Component {
	constructor() {
		super()
		this.runQuery = this.runQuery.bind(this)
		this.inviteUser = this.inviteUser.bind(this)
	}
	
	runQuery(username) {
		this.props.findUser(username)
	}

	inviteUser(username) {
		this.props.createRoom([username])
	}

	render() {
		return (
			<div>
				<h4>Find user:</h4>
				<UserFinderInput onChange={this.runQuery} />
				<UsersList usernames={this.props.foundUsers} onUserClick={this.inviteUser}/>
			</div>
		)
	}
}
module.exports = UserFinder