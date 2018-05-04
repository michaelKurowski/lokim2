const React = require('react')
//const {Link, Redirect} = require('react-router-dom')
const ConnectStatus = require('./connectStatus')
const Room = require('./room')

const socket = require('../utils/sockets/ws-routing')
const protocols = require('../utils/io-protocol')

/*
Consulted documentation:
https://github.com/facebook/create-react-app/issues/2260
https://github.com/socketio/socket.io/issues/1942#issuecomment-299764672
https://github.com/socketio/socket.io/issues/2294

https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/Redirect.md
https://socket.io/docs/client-api/

*/

function updateState(key, array, newItems){
    return {[key]: array.concat([newItems])}
}

class ChatPage extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            connected: false,
            input: '',
            messages: [],
            response: '',
            selectedRoom: '',
            username: this.props.location.state.username,
            userRooms: []
        }

        this.handleChange = this.handleChange.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }
    componentDidMount(){
        console.log('Connection:', socket.connected)
        socket.on(protocols.CONNECTION, () => this.setState({connected: true}))
        socket.on(protocols.JOIN, data => this.populateData(data))
        socket.on(protocols.MESSAGE, data => this.populateMessages(data))
    }
    populateData(data){
        const {roomId, username} = data
        console.log(data)
        this.setState(updateState('userRooms', this.state.userRooms, {roomId, username}))
    }
    populateRoomData(roomDetails){
        const {roomId} = roomDetails
        console.log('Populate Room Data', roomDetails)
        this.setState({selectedRoom: roomId}) 
    }
    populateMessages(roomID){
        const value = this.state.messages.map((e,i) => <li key={i}>{e}</li>)
        return value
    }
    findUsersOfRoom(roomId){
        const value = roomId
        ? this.state.userRooms.find(obj => obj.roomId === roomId)
        : null
        
        return value ? value.username : ''
    }
    handleChange(e) {
        this.setState({input: e.target.value})
    }
    sendMessage(){
        if(this.state.input.length > 0){
            socket.emit(protocols.MESSAGE, {
                roomId: this.state.selectedRoom,
                message: this.state.input
            })
        }
    }
    render(){

        return(
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <h2>User: {this.state.username.toUpperCase()}</h2>
                        <ul className='list-group roomIdList'>
                        {this.state.userRooms.map((e,i) => 
                            <Room key={i} name={`Room #${i}`} ID={e.roomId} onClick={() => this.populateRoomData(e)}/>
                        )}
                        </ul>
                    </div>
                    <div className='col-md-6'>
                        <div className='messageArea'>
                            <ul>
                                {this.populateMessages(this.state.selectedRoom)}
                            </ul>
                        </div>
                        <input className='form-control' placeholder='Message...' value={this.state.input} onChange={this.handleChange}/>
                        <button className='btn btn-primary' onClick={this.sendMessage}>Send</button>
                    </div>
                    <div className='col-md-3'>
                        <h4>Room Information/Etc </h4>
                        <ConnectStatus connection={this.state.connected}/>
                        <h6>Current Room: {this.state.selectedRoom}</h6>
                        <h6>Users in current room: {this.findUsersOfRoom(this.state.selectedRoom)}</h6>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = ChatPage