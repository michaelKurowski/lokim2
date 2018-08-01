const React = require('react')
const {Link, Redirect} = require('react-router-dom')
const logo = require('theme/assets/logo.svg')
const {paths} = require('routing-config')
const {connect} = require('react-redux')
const {actions} = require('services/session/session.actions')
const SESSION_STATES = require('services/session/sessionStates')
const webSocketProvider = require('../../../utils/sockets/ws-routing')
const webSocketActions = require('services/webSocket/webSocket.actions').actions
const CHAT_PATH = paths.CHAT
const REGISTER_PATH = paths.REGISTER


function mapStateToProps(store) {
	return {
		logInStatus: store.sessionReducer.status,
		error: store.sessionReducer.errorMessage
	}
}

function mapDispatchToProps(dispatch) {
	return {
		logIn: credentials => dispatch(actions.logIn(credentials)),
		connectToWebSocket: () => dispatch(webSocketActions.webSocketConnectionRequest())
	}
}

class HomePage extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			username: '',
			password: ''
		}

		this.updateCredentials = this.updateCredentials.bind(this)
		this.logIn = this.logIn.bind(this)
	}

	updateCredentials(event) {
		this.setState({ [event.target.name] : event.target.value})
	}

	logIn(event) {
		this.props.logIn({username: this.state.username, password: this.state.password})
		event.preventDefault()
	}

	isLoggedIn() {
		return this.props.logInStatus === SESSION_STATES.SUCCEDED
	}

	componentDidUpdate() {
		if (this.isLoggedIn() && this.isWebSocketNotOperating()) this.props.connectToWebSocket()
	}

	isWebSocketNotOperating() {
		const socket = webSocketProvider.get()
		return !socket || (socket.room.disconnected && socket.users.disconnected)
	}

	render() {
		if (this.isLoggedIn())
			return <Redirect to={{pathname: CHAT_PATH, state: {username: this.state.username}}}/>

		return (
			<div className="App">
				<div className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h2>Welcome to Loki Instant Messenger</h2>
					<p className="App-intro">Hello LokIM User!</p>
				</div>
				<form onSubmit={this.logIn}>
					<input className='user-input' type="text" value={this.state.username} onChange={this.updateCredentials} placeholder="Username" name="username" required/><br/>
					<input className='user-input' type="password" value={this.state.password} onChange={this.updateCredentials} placeholder="Password" name="password" required/><br/>
					<input type='submit' className='home-button btn btn-primary' value='Login'/>
				</form>
				<li className="home-button btn btn-secondary"><Link to={REGISTER_PATH}>Create Account</Link></li>
				<p className='info-paragraph'>LokIM connects to other users via websockets through a server and very little information is stored on the server post-emission. All data regarding a user is stored on said user&#8216;s device. The only information we store on the server is that which is required for essential functionality.</p>
			</div>
		)
	}   
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(HomePage)