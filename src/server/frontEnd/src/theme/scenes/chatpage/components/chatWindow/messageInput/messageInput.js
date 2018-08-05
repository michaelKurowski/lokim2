const React = require('react')

class MessageInput extends React.Component {
	constructor() {
		super()
		this.state = {
			input: ''
		}
		this.handleUserInput = this.handleUserInput.bind(this)
		this.onSubmit = this.onSubmit.bind(this)
	}

	sendMessage() {
		this.props.sendMessage(this.state.input)
		this.setState({input: ''})
	}

	handleUserInput(event) {
		this.setState({input: event.target.value})
	}

	onSubmit(event) {
		event.preventDefault()
		this.sendMessage()
	}

	render() {
		return (
			<form className='p-2 w-100' onSubmit={this.onSubmit} data-test='send-message'>
				<input className='form-control' placeholder='Message...' value={this.state.input} onChange={this.handleUserInput}/>
				<button className='btn btn-primary'>Send</button>
			</form>
		)
	}
}

module.exports = MessageInput