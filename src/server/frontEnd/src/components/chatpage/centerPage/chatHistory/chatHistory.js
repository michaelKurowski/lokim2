const React = require('react')
const ChatMessage = require('./chatMessage/chatMessage')

class ChatHistory extends React.Component {
	constructor() {
		super()
	}

	generateMessages() {
		return <ChatMessage />
	}

	render() {
		return (
			<div className='p-2'>
				{this.generateMessages()}
			</div>
		)
	}
}

module.exports = ChatHistory