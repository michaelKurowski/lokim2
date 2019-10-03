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
			<div className='border m-2 p-2 flex justify-between' >
				<div data-test='list-dialer-element' key={this.state.ID} onClick={this.props.onClick}>
					<li>{this.state.name}</li>
				</div>
				<div className='bg-primary text-light p-1' onClick={this.props.onLeave}>Leave</div>
			</div>

		)
	}
}

module.exports = RoomsListElement