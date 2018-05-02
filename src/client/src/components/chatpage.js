const React = require('react')
//const {Link, Redirect} = require('react-router-dom')
const io = require('socket.io-client')
const protocol = require('../utils/io-protocol').eventTypes

const IO_CONNECTION_URL = 'localhost:5000/room' /* Take this from config file in the future */
const socket = io(IO_CONNECTION_URL, {path: '/connection'})
const connectStyle = {
    color: 'blue'
}
const dcStyle = {
    color: 'red'
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
            username: this.props.location.state.username,
            userRooms: [],
            messages: [],
            response: ''
        }
         
    }
    componentDidMount(){
        //Setup socket.io here
        console.log('Component Mounted')
        socket.on('connect', _ => {
            this.setState({connected: true})
            console.log('connected to address:', _)
            if(this.state.username === 'jmoss'){
            socket.emit('create', {invitedUsersIndexes:['jmoss', 'test_user'] })
            }
            socket.on('joined', data => {
                console.log('Joined', data)
                const {roomId} = data
                this.setState({userRooms: this.state.userRooms.concat([roomId])})
                socket.on('message', msgData => {
                    console.log('Message', msgData)
                    this.setState({messages: this.state.messages.concat([msgData])})
                })
                socket.emit('message', {roomId, message: 'Hello World!: ' + Math.round(Math.random() * 10)})
               
                socket.emit('leave', {roomId})
            })
        })    
    }
    emitEvent(eventType, data){
        console.log('Emitter', eventType, data)
    }
    render(){

        return(
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-3'>
                        <h2>User: {this.state.username.toUpperCase()}</h2>
                        <ul className='list-group roomIdList'>
                        {this.state.userRooms.map((e,i) => <li key={i}>Room ID: {e}</li>)}
                        </ul>
                    </div>
                    <div className='col-md-6'>
                        <div className='messageArea'>
                            <ul>
                                {this.state.messages.map((e,i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                        <input className='form-control' placeholder='Message...'/>
                    </div>
                    <div className='col-md-3'>
                        <h4>Room Information/Etc </h4>
                        {this.state.connected ? 
                        <h4 style={connectStyle}>Connected</h4> 
                        : <h4 style={dcStyle}>Disconnected / Error </h4> }
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