const React = require('react')

class MessageInput extends React.Component {
	constructor() {
		super()
		this.state = {
			input: ''
		}
		this.handleUserInput = this.handleUserInput.bind(this)
		this.sendMessage = this.sendMessage.bind(this)
	}

	sendMessage() {
		this.props.sendMessage(this.state.input)
	}

	handleUserInput(event) {
		this.setState({input: event.target.value})
	}

	render() {
		return (
			<div className='p-2'>
				<input className='form-control' placeholder='Message...' onChange={this.handleUserInput}/>
				<button className='btn btn-primary' value={this.state.input} onClick={this.sendMessage}>Send</button>
			</div>
		)
	}
}

module.exports = MessageInput