const React = require('react')
class RoomMember extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<li className='list-group-item' key={this.props.username}> {this.props.username} </li>
		)
	}
}
module.exports = RoomMember