const React = require('react')
const {BrowserRouter, Link} = require('react-router-dom')
const _ = require('lodash')
const ConnectStatus = require('./connectStatus')
const Room = require('./room')
const socket = require('../utils/sockets/ws-routing')
const protocols = require('../utils/io-protocol')
const HOMEPAGE_PATH = '/'
const USERNAMES_PLACEHOLDER = ''
/*
Consulted documentation:
https://github.com/facebook/create-react-app/issues/2260
https://github.com/socketio/socket.io/issues/1942#issuecomment-299764672
https://github.com/socketio/socket.io/issues/2294

https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/Redirect.md
https://socket.io/docs/client-api/
https://www.w3schools.com/jsref/prop_win_sessionstorage.asp
https://www.w3schools.com/jsref/prop_win_localstorage.asp
https://developer.mozilla.org/en-US/docs/Web/API/Cache
https://davidwalsh.name/cache


*/
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

        this.handleUserInput = this.handleUserInput.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
    }
    componentDidMount(){
        socket.on(protocols.CONNECTION, () => this.setState({connected: true}))
        socket.on(protocols.MESSAGE, data => this.updateMessageState(data))
        socket.on(protocols.JOIN, data => this.updateJoinedRooms(data))
        socket.emit(protocols.JOIN, {roomId: 'df7a1d12-7be0-4aab-8685-0cbf237bb135'}) // Development purposes - remove in production
    }
    updateJoinedRooms(data){
        const {roomId} = data
        const usernames = data.username
        this.setState({userRooms: this.state.userRooms.concat({roomId, usernames})})
    }
    changeSelectedRoom(roomDetails){
        const {roomId} = roomDetails
        this.setState({selectedRoom: roomId}) 
    }
    storeMessage(roomId, newMessage){
        const store = window.sessionStorage
        const roomMessages = store.getItem(roomId)
        const updatedRoomMessages = _.concat(roomMessages, newMessage)
        store.setItem(roomId, updatedRoomMessages)

        console.log('newMessage:', newMessage, 'roomMessages:', roomMessages, 'updated:', updatedRoomMessages)
        console.log(store.getItem(roomId))
    }
    updateMessageState(messageData){
        const {roomId, username, message, timestamp} = messageData
        this.storeMessage(roomId, {username, message, timestamp})

        if(roomId === this.state.selectedRoom)
            this.setState({messages: window.sessionStorage.getItem(roomId)})
    }
    findUsersOfRoom(roomId){
        const roomObject = this.state.userRooms.find(room => room.roomId === roomId)
        return _.get(roomObject, 'usernames', USERNAMES_PLACEHOLDER)
    }
    generateMessages(){
        if(this.state.selectedRoom){
            if(!_.isEmpty(this.state.messages))
                return this.state.messages.map((msg, i) => 
                    <li className='message' key={i}>
                        {`${msg.username}:\t ${msg.message} \t ${msg.timestamp}`}
                    </li>
                )
        }
        return <h6>Please join a room before attempting to load messages</h6>
    }
    handleUserInput(event) {
        this.setState({input: event.target.value})
    }
    sendMessage(){
        if(!_.isEmpty(this.state.input) && this.state.selectedRoom){
            const roomId =  this.state.selectedRoom
            const message = this.state.input
            socket.emit(protocols.MESSAGE, {roomId, message})

            const localMessage = {roomId, username: this.state.username, message, timestamp: new Date().getTime()}
            this.updateMessageState(localMessage)
        }
            return console.error('No room selected || input field is empty.')
            //TODO - Add GUI Notification of fail
    }
    render(){
        return(
            <div className='container-fluid'>
                <div className='row'>
                    <div className='sidebar col-md-3'>
                        <h2>User: {this.state.username.toUpperCase()}</h2>
                        <ul className='list-group room-ID-list'>
                        <p>Click The Pinkness for Room Selection</p>
                        {this.state.userRooms.map((e,i) => 
                            <Room key={i} name={`Room #${i}`} ID={e.roomId} onClick={() => this.changeSelectedRoom(e)}/>
                        )}
                        </ul>
                    </div>
                    <div className='col-md-6'>
                        <div className='message-area'>
                            <ul>
                               {this.generateMessages()}
                            </ul>
                        </div>
                        <input className='form-control' placeholder='Message...' value={this.state.input} onChange={this.handleUserInput}/>
                        <button className='btn btn-primary' onClick={this.sendMessage}>Send</button>
                    </div>
                    <div className='col-md-3'>
                        <h4>Room Information/Etc </h4>
                        <ConnectStatus connection={this.state.connected}/>
                        <h6>Current Room: {this.state.selectedRoom}</h6>
                        <h6>Users in current room: {this.findUsersOfRoom(this.state.selectedRoom)}</h6>
                        <Link className='btn btn-danger' to={HOMEPAGE_PATH}>Logout</Link>
                    </div>
                </div>
            </div>
        )
    }
}

module.exports = ChatPage