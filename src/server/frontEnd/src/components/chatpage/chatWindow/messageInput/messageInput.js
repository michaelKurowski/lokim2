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
		this.props.addMessage({date: new Date().getTime(), text: this.state.input, author: 'Mike'})
	}

	handleUserInput(event) {
		this.setState({input: event.target.value})
	}

	render() {
		return (
			<div className='p-2'>
				<input className='form-control' placeholder='Message...' onChange={this.handleUserInput}/>
				<button className='btn btn-primary' onClick={this.sendMessage}>Send</button>
			</div>
		)
	}
}

module.exports = MessageInput