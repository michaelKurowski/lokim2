const React = require('react')
const {Link, Redirect} = require('react-router-dom')
const _fetch = require('node-fetch')
const {urls, paths} = require('routing-config')
const SUCCESS_CODE = 200
const USER_ALREADY_EXIST = 400
const REGISTER_URL = urls.REGISTER
const HOMEPAGE_PATH = paths.HOME
const POST = 'POST'
const headers = { 'Content-Type': 'application/json' }

class Register extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			username: '',
			password: '',
			email: '',
			successfulRegister: false
		}
		this.updateCredentials = this.updateCredentials.bind(this)
		this.registerUser = this.registerUser.bind(this)
	}
	updateCredentials(event) {
		this.setState({ [event.target.name] : event.target.value})
	}
    
	registerUser(event) {
		this.registerHandler(this.state)
		event.preventDefault()
	}
	registerHandler(userData, fetch) {
		fetch = fetch || _fetch
		const {username, password, email} = userData
		fetch(REGISTER_URL, {
			method: POST, headers,
			body: JSON.stringify({username, password, email})
		}).then(response => {
			switch(response.status) {
				case SUCCESS_CODE:
					this.setState({successfulRegister: true})
					break
				case USER_ALREADY_EXIST:
					alert('User already exist')
					break
				default:
					console.error(new Error(`Unexpected answer to registration request: ${response.status}`))
			}
		}).catch(err => console.error(err))
	}
	render() {
		if(this.state.successfulRegister) {
			return <Redirect to={HOMEPAGE_PATH}/>
		}
		return (
			<div className='container-fluid register-div' id='register'>
				<h2> Register for a new LokIM Account </h2>
				<form onSubmit={this.registerUser}>
					<input type='text' className='user-input' placeholder='Username' value={this.state.username} onChange={this.updateCredentials} name='username' required/><br/>
					<input type='password' className='user-input' placeholder='Password' value={this.state.password} onChange={this.updateCredentials} name='password' required/><br/>
					<input type='text' className='user-input' placeholder='Email' value={this.state.email} onChange={this.updateCredentials} name='email' required/><br/>
					<input type='submit' className='btn btn-primary register-button' value='Register'/>
					<Link className='btn btn-secondary' to={HOMEPAGE_PATH}>Go Back</Link>
				</form>   
			</div>
		)
	}
}

module.exports = Register