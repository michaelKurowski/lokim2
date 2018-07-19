const React = require('react')
const MessageInput = require('./messageInput/messageInput')
const ChatHistory = require('./chatHistory/chatHistory')
class ChatWindow extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div className='col-md-6 h-100-vh d-flex flex-column'>
				<ChatHistory messages={this.props.messages}/>
				<MessageInput sendMessage={this.props.sendMessage}/>
			</div>
		)
	}
}

module.exports = ChatWindow