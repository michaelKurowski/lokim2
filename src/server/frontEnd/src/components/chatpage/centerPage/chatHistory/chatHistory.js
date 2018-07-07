const React = require('react')
const ChatMessage = require('./chatMessage/chatMessage')

class ChatHistory extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div className='p-2'>
				<ChatMessage />
			</div>
		)
	}
}

module.exports = ChatHistory