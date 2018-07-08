const React = require('react')
const ChatMessage = require('./chatMessage/chatMessage')

class ChatHistory extends React.Component {
	constructor() {
		super()
	}

	generateMessages() {
		return this.props.messages.map((message, index) => 
			(<ChatMessage key={index} text={message.text} date={message.date} author={message.username} />))
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