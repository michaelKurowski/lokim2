const React = require('react')
const ChatMessage = require('./chatMessage/chatMessage')

class ChatHistory extends React.Component {
	constructor() {
		super()
		this.messagesHistoryElement = React.createRef()
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

	componentDidUpdate() {
		this.scrollDown()
	}

	scrollDown() {
		this.messagesHistoryElement.current.scrollTop = this.messagesHistoryElement.current.scrollHeight
	}

	render() {
		return (
			<div ref={this.messagesHistoryElement} className='message-area p-2 y-scroll h-100'>
				<ul className='list-group room-ID-list'>
					{this.generateMessages()}
				</ul>
			</div>
		)
	}
}

module.exports = ChatHistory