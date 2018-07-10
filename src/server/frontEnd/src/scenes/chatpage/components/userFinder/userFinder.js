const React = require('react')
const UsersList = require('../usersList/usersList')
const UserFinderInput = require('./userFinderInput/userFinderInput')
class UserFinder extends React.Component {
	constructor() {
		super()
		this.runQuery = this.runQuery.bind(this)
		this.inviteUser = this.inviteUser.bind(this)
		this.state = {
			isQuerrying: false
		}
	}
	
	runQuery(username) {
		this.props.findUser(username)
		this.setState({isQuerrying: true})
	}

	inviteUser(username) {
		this.props.createRoom([username])
		this.setState({isQuerrying: false})
	}

	showQuerryingResults() {
		if (this.state.isQuerrying)
			return <UsersList usernames={this.props.foundUsers} onUserClick={this.inviteUser}/>
	}

	render() {
		return (
			<div>
				<h4>Find user:</h4>
				<UserFinderInput onChange={this.runQuery} isQuerrying={this.state.isQuerrying}/>
				{this.showQuerryingResults()}
			</div>
		)
	}
}
module.exports = UserFinder