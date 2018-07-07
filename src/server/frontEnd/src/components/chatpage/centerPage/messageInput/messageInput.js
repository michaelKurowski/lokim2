const React = require('react')

class MessageInput extends React.Component {
	constructor() {
		super()
	}

	sendMessage() {
		
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