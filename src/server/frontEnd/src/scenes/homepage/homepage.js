const React = require('react')
const {Link, Redirect} = require('react-router-dom')
const logo = require('../../theme/assets/logo.svg')
const _fetch = require('node-fetch')
const {urls, paths} = require('../../routes/routes.json')
const LOGIN_URL = urls.LOGIN
const POST = 'POST'
const credentials = 'same-origin'
const headers = { 'Content-Type': 'application/json' }

const CHAT_PATH = paths.CHAT
const REGISTER_PATH = paths.REGISTER

class HomePage extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			username: '',
			password: '',
			successfulLogin: false
		}

		this.updateCredentials = this.updateCredentials.bind(this)
		this.logIn = this.logIn.bind(this)
	}

	loginHandler(username, password, fetch) {
		fetch = fetch || _fetch
		fetch(LOGIN_URL, {
			method: POST, headers, credentials,
			body: JSON.stringify({username, password})
		}).then(response => {
			switch (response.status) {
				case 200:
					this.setState({successfulLogin: true})
					break
				case 401:
					alert('Login failed')
					break
				default:
					console.error(new Error(`Unexpected response to authorization request: ${response.status}`))
			}
			
		}).catch(err => console.error(new Error(err)))
	}

	updateCredentials(event) {
		this.setState({ [event.target.name] : event.target.value})
	}
	logIn(event) {
		this.loginHandler(this.state.username, this.state.password)
		event.preventDefault()
	}
	render() {
		if(this.state.successfulLogin)
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

module.exports = HomePage