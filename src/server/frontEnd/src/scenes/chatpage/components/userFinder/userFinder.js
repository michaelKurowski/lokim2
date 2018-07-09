const React = require('react')
class UserFinder extends React.Component {
	constructor() {
		super()
	}

	render() {
		return (
			<div>
                <h4>Find user:</h4>
                <input className='form-control' palceholder='Username' value={this.state.userToFind} onChange={this.handleUserToFindInput}/>
                <ul className='list-group room-ID-list'>
                    {this.generateFoundUsers()}
                </ul>
            </div>
		)
	}
}
module.exports = UserFinder