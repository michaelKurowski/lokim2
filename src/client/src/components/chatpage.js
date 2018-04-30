const React = require('react')
//const {Link, Redirect} = require('react-router-dom')
const socketIOClient = require('socket.io-client')
const protocol = require('../utils/io-protocol').eventTypes

const endpoint = 'http://localhost:5000' /* Take this from config file in the future */

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
            username: this.props.location.state.username,
            messages: [],
            response: ''
        }
    }
    componentDidMount(){
        //Setup socket.io here
        console.log('Component Mounted')
        const socket = socketIOClient(endpoint, {path: '/room'})
        
        socket.on(protocol.CONNECTION, data => {
            console.log(socket)
            console.log(data)
            socket.emit(protocol.CREATE, {invitedUsersIndexes: [this.state.username]}, res => console.log(res))
        })
    }
    render(){

        return(
            <div className='container-fluid'>
                <h2>Chat is in development</h2>
                <h4>Response: {this.state.response}</h4>
                <p> Hello {this.state.username}!</p>
                <p> Testing Socket.IO with the backend </p>
                <ul>
                {this.state.messages.map((e,i) => <li key={i}>{e}</li>)}
                </ul>
            </div>
        )
    }
}

module.exports = ChatPage