const SIDE_PANEL_DIRECTIONS = require('./sidePanelDirections')
const React = require('react')
class SidePanel extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		switch(this.props.direction) {
		case SIDE_PANEL_DIRECTIONS.LEFT:
			return (
				<div className={'w-1/4 ' + `bg-${this.props.color}`}>
					{this.props.children}
				</div>
			)
		case SIDE_PANEL_DIRECTIONS.RIGHT:
			return (
				<div className={'w-1/4 ' + `bg-${this.props.color}`}>
					{this.props.children}
				</div>
			)
		default: 
			return <div></div>
		}
	}
}

module.exports = SidePanel