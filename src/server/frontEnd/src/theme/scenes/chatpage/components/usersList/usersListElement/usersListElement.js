const React = require('react')
const Avatar = require('theme/components/avatar/avatar')
const AVATAR_SIZES = require('theme/components/avatar/avatarSizes')

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
				<Avatar username={this.props.username} size={AVATAR_SIZES.MEDIUM}/>
				<span>{this.props.username}</span>
			</li>
		)
	}
}
module.exports = UsersListElement