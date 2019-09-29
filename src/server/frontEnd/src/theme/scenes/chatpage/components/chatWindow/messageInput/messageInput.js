const React = require('react')
const _ = require('lodash')
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
		if (_.isEmpty(this.state.input)) return
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
			<form className='p-2 w-100 flex justify-between' onSubmit={this.onSubmit}>
				<input
					className='form-control'
					placeholder='Message...'
					value={this.state.input}
					onChange={this.handleUserInput}
					data-test='message-input'
				/>
				<button className='btn btn-primary' data-test='send-message' >Send</button>
			</form>
		)
	}
}

module.exports = MessageInput