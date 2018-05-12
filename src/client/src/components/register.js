const React = require('react')
const {Link, Redirect} = require('react-router-dom')
const _fetch = require('node-fetch')
const {urls, paths} = require('../routes/routes')
const SUCCESS_CODE = 200
const REGISTER_URL = urls.REGISTER_URL
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
		this.handleChange = this.handleChange.bind(this)
		this.handleSubmit = this.handleSubmit.bind(this)
	}
	handleChange(event) {
		if(!Object.keys(this.state).includes(event.target.name)) return //ADD GUI NOTIFICATION ISSUE #49
		this.setState({ [event.target.name] : event.target.value})
	}
    
	handleSubmit(event) {
		this.registerHandler(this.state)
		event.preventDefault()
	}
	registerHandler(userData, fetch) {
		fetch = fetch || /* istanbul ignore next */ _fetch
		const {username, password, email} = userData
		fetch(REGISTER_URL, {
			method: POST, headers,
			body: JSON.stringify({username, password, email})
		})
			.then(response => {
				/* istanbul ignore next */ 
				if(response.status === SUCCESS_CODE) {
					this.setState({successfulRegister: true})
				}
			}).catch(err => console.log(err))
	}
	render() {
		if(this.state.successfulRegister) {
			return <Redirect to={HOMEPAGE_PATH}/>
		}
		return (
			<div className='container-fluid register-div'>
				<h2> Register for a new LokIM Account </h2>
				<form onSubmit={this.handleSubmit}>
					<input type='text' className='user-input' placeholder='Username' value={this.state.username} onChange={this.handleChange} name='username' required/><br/>
					<input type='password' className='user-input' placeholder='Password' value={this.state.password} onChange={this.handleChange} name='password' required/><br/>
					<input type='text' className='user-input' placeholder='Email' value={this.state.email} onChange={this.handleChange} name='email' required/><br/>
					<input type='submit' className='btn btn-primary register-button' value='Register'/>
					<Link className='btn btn-secondary' to={HOMEPAGE_PATH}>Go Back</Link>
				</form>   
			</div>
		)
	}
}

module.exports = Register