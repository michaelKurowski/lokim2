const React = require('react')
const Avatar = require('theme/components/avatar/avatar')
class UsersListElement extends React.Component {
	constructor() {
		super()
		this.returnUsername = this.returnUsername.bind(this)
	}

	returnUsername() {
		this.props.onClick(this.props.username)
	}

	render() {
		return (
			<li className='list-group-item' onClick={this.returnUsername}>
				<Avatar username={this.props.username} size='24'/>
				<span>{this.props.username}</span>
			</li>
		)
	}
}
module.exports = UsersListElement