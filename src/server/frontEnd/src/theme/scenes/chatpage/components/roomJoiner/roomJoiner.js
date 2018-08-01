const React = require('react')
class RoomJoiner extends React.Component {
	constructor() {
		super()
		this.state = {
			roomToJoin: ''
		}
		this.handleRoomToJoinUserInput = this.handleRoomToJoinUserInput.bind(this)
		this.joinSelectedRoom = this.joinSelectedRoom.bind(this)
	}

	handleRoomToJoinUserInput(event) {
		const roomToJoin = event.target.value
		this.setState({roomToJoin})
	}

	joinSelectedRoom() {
		this.props.joinRoom(this.state.roomToJoin)
	}

	render() {
		return (
			<div>
				<input className='form-control' palceholder='Room name' value={this.state.roomToJoin} onChange={this.handleRoomToJoinUserInput}/>
				<button className='btn btn-primary' onClick={this.joinSelectedRoom}> Join Room </button>
			</div>
		)
	}
}
module.exports = RoomJoiner