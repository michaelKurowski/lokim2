const React = require('react')
const UsersList = require('../usersList/usersList')
const UserFinderInput = require('./userFinderInput/userFinderInput')
class UserFinder extends React.Component {
	constructor() {
		super()
		this.runQuery = this.runQuery.bind(this)
		this.inviteUser = this.inviteUser.bind(this)
		this.state = {
			isQuerying: false
		}
	}
	
	runQuery(username) {
		this.props.findUser(username)
		this.setState({isQuerying: true})
	}

	inviteUser(username) {
		this.props.createRoom([username])
		this.setState({isQuerying: false})
	}

	showQuerryingResults() {
		if (this.state.isQuerying)
			return <UsersList usernames={this.props.foundUsers} onUserClick={this.inviteUser} data-test='users-finder-results'/>
	}

	render() {
		return (
			<div>
				<h4>Find user:</h4>
				<UserFinderInput onChange={this.runQuery} isQuerying={this.state.isQuerying}/>
				{this.showQuerryingResults()}
			</div>
		)
	}
}
module.exports = UserFinder