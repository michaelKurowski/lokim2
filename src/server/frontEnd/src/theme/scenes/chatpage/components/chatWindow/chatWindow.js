const React = require('react')
const MessageInput = require('./messageInput/messageInput')
const ChatHistory = require('./chatHistory/chatHistory')
class ChatWindow extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div className='w-full flex flex-col justify-end h-full'>
				<ChatHistory messages={this.props.messages}/>
				<MessageInput sendMessage={this.props.sendMessage}/>
			</div>
		)
	}
}

module.exports = ChatWindow