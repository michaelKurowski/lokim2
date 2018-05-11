const React = require('react')
const PropTypes = require('prop-types')

class Room extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			ID: this.props.ID,
			name: this.props.name
		}
	}
	render() {
		return(
			<div className='room-ID' key={this.state.ID} onClick={this.props.onClick}>
				<li>{this.state.name}</li>
			</div>
		)
	}
}
Room.propTypes = {
	ID: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired
}

module.exports = Room