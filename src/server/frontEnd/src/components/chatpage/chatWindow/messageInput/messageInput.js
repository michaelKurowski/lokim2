const React = require('react')

class MessageInput extends React.Component {
	constructor() {
		super()
		this.state = {
			input: ''
		}
		this.handleUserInput = this.handleUserInput.bind(this)
	}

	sendMessage() {
		
	}

	handleUserInput(event) {
		this.setState({input: event.target.value})
	}

	render() {
		return (
			<div className='p-2'>
				<input className='form-control' placeholder='Message...' value={this.state.input} onChange={this.handleUserInput}/>
				<button className='btn btn-primary' onClick={this.sendMessage}>Send</button>
			</div>
		)
	}
}

module.exports = MessageInput