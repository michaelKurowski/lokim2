const React = require('react')
const MessageInput = require('./messageInput/messageInput')
const ChatHistory = require('./chatHistory/chatHistory')
class CenterPage extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div>
				<ChatHistory />
				<MessageInput />
			</div>
		)
	}
}

module.exports = CenterPage