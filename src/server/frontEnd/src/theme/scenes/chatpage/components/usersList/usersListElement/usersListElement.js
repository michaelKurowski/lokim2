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
			<li className='list-group-item' onClick={this.returnUsername}>
				<img src={`http://robohash.org/${this.props.username}?size=50x50`}></img>
				<span>{this.props.username}</span>
			</li>
		)
	}
}
module.exports = UsersListElement