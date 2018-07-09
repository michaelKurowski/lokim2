const React = require('react')
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
			<li className='list-group-item' onClick={this.returnUsername}> {this.props.username} </li>
		)
	}
}
module.exports = UsersListElement