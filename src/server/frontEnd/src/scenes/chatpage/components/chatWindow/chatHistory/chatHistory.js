const React = require('react')
const ChatMessage = require('./chatMessage/chatMessage')

class ChatHistory extends React.Component {
	constructor() {
		super()
	}

	generateMessages() {
		if (!this.props.messages) return
		return this.props.messages.map(message => 
			(<ChatMessage
				key={message.message+message.timestamp+message.username}
				text={message.message}
				date={message.timestamp}
				author={message.username}
			/>))
	}

	render() {
		return (
			<div className='message-area p-2 y-scroll'>
				<ul className='list-group room-ID-list'>
					{this.generateMessages()}
				</ul>
			</div>
		)
	}
}

module.exports = ChatHistory