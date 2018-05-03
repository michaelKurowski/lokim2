const React = require('react')
//const {Link, Redirect} = require('react-router-dom')
const io = require('socket.io-client')
const protocol = require('../utils/io-protocol').eventTypes
const Room = require('./room')
const IO_CONNECTION_URL = 'localhost:5000/room' /* Take this from config file in the future */
const socket = io(IO_CONNECTION_URL, {path: '/connection'})


function ConnectStatus(connection){
    return connection ? <h4 style={{color: 'blue'}}>Connected</h4> 
        : <h4 style={{color: 'red'}}>Disconnected / Error </h4> 
}

function updateState(key, array, newItems){
    return {[key]: array.concat([newItems])}
}
/*
Consulted documentation:
https://github.com/facebook/create-react-app/issues/2260
https://github.com/socketio/socket.io/issues/1942#issuecomment-299764672
https://github.com/socketio/socket.io/issues/2294

https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/api/Redirect.md
https://socket.io/docs/client-api/

*/
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
    }
    componentDidMount(){
        //Setup socket.io here
        console.log('Component Mounted')
        socket.on('connect', _ => {
            this.setState({connected: true})
            console.log('connected to address:', _)
            console.log(socket)
            socket.on('join', data => {
                console.log('Joined', data)
                const {roomId, username} = data
                this.setState(updateState('userRooms', this.state.userRooms, {roomId, username}))
                socket.on('message', msgData => {
                    console.log('Message', msgData)
                    this.setState(updateState('messages', this.state.messages, msgData))
                })
                socket.emit('message', {roomId, message: 'Hello World!: ' + Math.round(Math.random() * 10)})
            })
        })    
    }
    emitEvent(eventType, data){
        console.log('Emitter', eventType, data)
    }
    populateData(roomDetails){
        const {roomId} = roomDetails
        console.log('Populate', roomDetails)
        this.setState({selectedRoom: roomId}) 
    }
    populateMessages(roomID){
        const value = this.state.messages.map((e,i) => <li key={i}>{e}</li>)
        return value
    }
    findUsers(roomId){
        const value = this.state.userRooms.find(obj => obj.roomId === roomId)
        console.log('findUsers', value)
        return !!value ? value.username : ''
    }
    handleChange(e) {
        this.setState({input: e.target.value})
    }
    render(){

        return(
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <h2>User: {this.state.username.toUpperCase()}</h2>
                        <ul className='list-group roomIdList'>
                        {this.state.userRooms.map((e,i) => <Room name={`Room #${i}`} ID={e.roomId} onClick={() => this.populateData(e)}/>)}
                        </ul>
                    </div>
                    <div className='col-md-6'>
                        <div className='messageArea'>
                            <ul>
                                {this.populateMessages(this.state.selectedRoom)}
                            </ul>
                        </div>
                        <input className='form-control' placeholder='Message...' value={this.state.input} onChange={this.handleChange}/>
                    </div>
                    <div className='col-md-3'>
                        <h4>Room Information/Etc </h4>
                        <ConnectStatus />
                        <h6>Current Room: {this.state.selectedRoom}</h6>
                        <h6>Users in current room: {this.findUsers(this.state.selectedRoom)}</h6>
                    </div>
                </div>
            </div>
        )
    }
    /*

    <h2>Chat is in development</h2>
                <h4>Response: {this.state.response}</h4>
                <p> Hello {this.state.username}!</p>
                <p> Testing Socket.IO with the backend </p>
                <ul>
                {this.state.messages.map((e,i) => <li key={i}>{e}</li>)}
                </ul>

    */
}

module.exports = ChatPage