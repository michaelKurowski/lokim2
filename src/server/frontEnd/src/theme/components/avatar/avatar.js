const React = require('react')
const SIZES = require('./avatarSizes')

class Avatar extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			username: this.props.username,
			size: this.props.size
		}
	}
	
	render() {
		return(
			<div className={`w-${SIZES[this.state.size]} h-${SIZES[this.state.size]}`}>
				<img src={`http://robohash.org/${this.state.username}`}/>
			</div>
		)
	}
}

module.exports = Avatar