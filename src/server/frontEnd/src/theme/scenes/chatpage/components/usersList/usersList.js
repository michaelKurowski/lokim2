const React = require('react')
const UsersListElement = require('./usersListElement/usersListElement')
class UsersList extends React.Component {
	constructor() {
		super()
		this.onUserClick = this.onUserClick.bind(this)
	}

	onUserClick(username) {
		if (!this.props.onUserClick) return
		this.props.onUserClick(username)
	}

	render() {
		return (
			<ul>
				{this.props.usernames.map(username =>
					<UsersListElement
						username={username}
						key={username}
						onClick={this.onUserClick}
					/>
				)}
			</ul>
		)
	}
}
module.exports = UsersList