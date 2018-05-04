const React = require('react')
const {Link} = require('react-router-dom')
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
            messages: {},
            selectedRoom: '',
            username: this.props.location.state.username,
            userRooms: []
        }

        this.handleChange = this.handleChange.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }
    componentDidMount(){
        socket.on(protocols.CONNECTION, _ => this.setState({connected: true}))
        socket.on(protocols.MESSAGE, data => this.populateMessages(data))
        socket.on(protocols.JOIN, data => this.populateData(data))
        socket.emit(protocols.JOIN, {roomId: 'df7a1d12-7be0-4aab-8685-0cbf237bb135'}) // Development purposes - remove in production
    }
    populateData(data){
        const {roomId, username} = data
        this.setState(updateState('userRooms', this.state.userRooms, {roomId, username}))
    }
    changeSelectedRoom(roomDetails){
        const {roomId} = roomDetails
        this.setState({selectedRoom: roomId}) 
    }
    populateMessages(messageData){
        const {roomId, username, message, timestamp} = messageData
        //Create a clone to mutate
        const messages = Object.assign({}, this.state.messages)
        //Add new message to the list
        messages[roomId] = (messages[roomId] || []).concat({username, message, timestamp})
        //Update list
        this.setState({messages})
    }
    findUsersOfRoom(roomId){
        const value = roomId
        ? this.state.userRooms.find(obj => obj.roomId === roomId)
        : null
        
        return value ? value.username : ''
    }
    generateMessages(){
        //Check that a room is selected
        if(this.state.selectedRoom){
                //Check if the room has messages
            if(!this.state.messages[this.state.selectedRoom]) return

            return this.state.messages[this.state.selectedRoom]
                .map((msg, i) => <li key={i}>{`${msg.username}:\t ${msg.message} \t ${msg.timestamp}`}</li>)
        }

        return <h6>Please join a room before attempting to load messages</h6>
    }
    handleChange(e) {
        this.setState({input: e.target.value})
    }
    sendMessage(){
        if(this.state.input.length > 0 && this.state.selectedRoom){
            const roomId =  this.state.selectedRoom, message = this.state.input
            socket.emit(protocols.MESSAGE, {roomId, message})

            const localMessage = {roomId, username: this.state.username, message, timestamp: new Date().getTime()}
            this.populateMessages(localMessage)
        }
            return console.error('No room selected || input field is empty.')
            //TODO - Add GUI Notification of fail
    }
    render(){

        return(
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <h2>User: {this.state.username.toUpperCase()}</h2>
                        <ul className='list-group roomIdList'>
                        <p>Click The Pinkness for Room Selection</p>
                        {this.state.userRooms.map((e,i) => 
                            <Room key={i} name={`Room #${i}`} ID={e.roomId} onClick={() => this.changeSelectedRoom(e)}/>
                        )}
                        </ul>
                    </div>
                    <div className='col-md-6'>
                        <div className='messageArea'>
                            <ul>
                               {this.generateMessages()}
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
                        <Link className='btn btn-danger' to='/'>Logout</Link>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = ChatPage