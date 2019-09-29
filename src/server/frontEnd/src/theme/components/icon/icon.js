const React = require('react')

class Icon extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			size: this.props.size,
			path: `assets/${this.props.icon}.svg`
		}
	}

	render() {
		return(
			<div className={`w-${this.state.size} `+ `h-${this.state.size}`}> 
				<img src={this.state.path}/>
			</div>
		)
	}
}

module.exports = Icon