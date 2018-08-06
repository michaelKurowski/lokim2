const SIDE_PANEL_DIRECTIONS = require('./sidePanelDirections')
const React = require('react')
class SidePanel extends React.Component {
	constructor() {
		super()
	}

	render() {
		switch(this.props.direction) {
		case SIDE_PANEL_DIRECTIONS.LEFT:
			return (
				<div className='col-md-3 jumbotron'>
					{this.props.children}
				</div>
			)
		case SIDE_PANEL_DIRECTIONS.RIGHT:
			return (
				<div className='col-md-3 jumbotron'>
					{this.props.children}
				</div>
			)
		default: 
			return <div></div>
		}
	}
}

module.exports = SidePanel