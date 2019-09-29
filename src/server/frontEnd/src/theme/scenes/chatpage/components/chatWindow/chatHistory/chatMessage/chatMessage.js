const React = require('react')
const Avatar = require('theme/components/avatar/avatar')
const AVATAR_SIZES = require('theme/components/avatar/avatarSizes')

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
					<Avatar username={this.props.author} size={AVATAR_SIZES.SMALL}/>
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