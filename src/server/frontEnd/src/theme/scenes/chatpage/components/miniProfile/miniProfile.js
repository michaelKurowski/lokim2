const React = require('react')

class ProfileAvatar extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div className='card'>
				<img className='card-img-top' src={`http://robohash.org/${this.props.username}`}></img>
				<div className='card-body'>
					<h2 className='card-title'>{this.props.username}</h2>
					<h6 className='card-subtitle mb-2 text-muted'>No description</h6>
				</div>
			</div>
		)
	}
}

module.exports = ProfileAvatar