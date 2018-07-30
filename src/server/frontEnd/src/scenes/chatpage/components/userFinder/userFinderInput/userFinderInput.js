const React = require('react')
class UserFinderInput extends React.Component {
	constructor() {
		super()
		this.state = {
			username: ''
		}
		this.setUsername = this.setUsername.bind(this)
	}
	
	setUsername(event) {
		const username= event.target.value
		this.setState({username})
		this.props.onChange(username)
	}

	didCeasedToQuery(previousProps) {
		return previousProps.isQuerrying && !this.props.isQuerrying
	}

	render() {
		return (
			<input
				className='form-control'
				placeholder='Username'
				value={this.props.isQuerrying ? this.state.username : ''}
				onChange={this.setUsername}
			/>
		)
	}
}
module.exports = UserFinderInput