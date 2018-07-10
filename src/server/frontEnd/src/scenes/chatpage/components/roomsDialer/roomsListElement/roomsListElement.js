const React = require('react')

class RoomsListElement extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			ID: this.props.ID,
			name: this.props.name
		}
	}
	render() {
		return(
			<div className='room-ID list-group-item' key={this.state.ID} onClick={this.props.onClick}>
				<li>{this.state.name}</li>
			</div>
		)
	}
}

module.exports = RoomsListElement