const React = require('react')
class UsersListElement extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<li className='list-group-item' key={this.props.username} onClick={this.props.onClick}> {this.props.username} </li>
		)
	}
}
module.exports = UsersListElement