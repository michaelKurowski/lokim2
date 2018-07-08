const React = require('react')
const MessageInput = require('./messageInput/messageInput')
const ChatHistory = require('./chatHistory/chatHistory')
class ChatWindow extends React.Component {
	constructor() {
		super()

		this.state = {
			messages: [
				{author: 'Mike', date: new Date().getTime(), text: 'I\'m cool'},
				{author: 'Mike2', date: new Date().getTime() + 10000, text: 'Me as well'}
			]
		}
	}

	render() {
		return (
			<div>
				<ChatHistory messages={this.state.messages}/>
				<MessageInput/>
			</div>
		)
	}
}

module.exports = ChatWindow