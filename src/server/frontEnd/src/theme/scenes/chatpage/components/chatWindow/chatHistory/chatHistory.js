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
				key={message.payload.text+message.date+message.payload.author}
				text={message.payload.text}
				date={message.date}
				author={message.payload.author}
				data-test='chat-message'
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
			<div ref={this.messagesHistoryElement} className='p-2 y-scroll h-100 w-100'>
				<ul className='list-group room-ID-list' data-test='chat-history'>
					{this.generateMessages()}
				</ul>
			</div>
		)
	}
}

module.exports = ChatHistory