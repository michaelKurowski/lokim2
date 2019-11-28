const React = require('react')
const Avatar = require('../avatar/avatar')

class Message extends React.Component {
	constructor(props) {
		super(props)
	}
	
	render() {
		return(
			<div className='w-full flex bg-light flex-row p-5'>
				<div>
					<Avatar size='SMALL' username={this.props.username} />
				</div>
				<div className='flex flex-col'>
					<div>{this.props.username}</div>
					<div>{this.props.text}</div>
				</div>
			</div>
		)
	}
}

module.exports = Message