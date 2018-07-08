const React = require('react')

class ChatMessage extends React.Component {
	constructor() {
		super()
	}

	getMessageDate() {
		return new Date(this.props.date).toLocaleTimeString()
	}

	render() {
		return (
			<li className='message list-group-item'>
				<p>
					<img height='50px' src={`http://robohash.org/${this.props.author}`}></img>
					<span className='font-weight-bold'>{this.props.author}</span></p>
				<p>
					<span>{this.props.text}</span>
					<span className='text-muted float-right'>{this.getMessageDate()}</span>
				</p>
			</li>
		)
	}
}

module.exports = ChatMessage