const React = require('react')
const RoomsListElement = require('./roomsListElement/roomsListElement')
const _= require('lodash')
class RoomsDialer extends React.Component {
	constructor() {
		super()
	}
	
	generateRooms() {
		if(_.isEmpty(this.props.rooms)) return
		return this.props.rooms.map(
			(room, roomIndex) => 
				<RoomsListElement 
					key={roomIndex}
					name={`Room #${room}`}
					ID={room}
					onClick={() => this.props.selectRoom({roomId: room})}
				/>
		)
	}

	render() {
		return (
			<ul className='list-group room-ID-list'>
				<h1>Choose a room</h1>
				{this.generateRooms()}
			</ul>
		)
	}
}
module.exports = RoomsDialer