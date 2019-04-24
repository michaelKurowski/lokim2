const React = require('react')
const HomePage = require('./scenes/homepage/homepage')
const Register = require('./scenes/register/register')
const ChatPage = require('./scenes/chatpage/chatpage')
const VerifyEmail = require('./scenes/verifyEmail/verifyEmail')
const InvalidEmailPage = require('./scenes/verifyEmail/invalid')
const {BrowserRouter, Route} = require('react-router-dom')
const {paths} = require('routing-config')
const LOGIN_URL = paths.HOME
const REGISTER_URL = paths.REGISTER
const CHAT_URL = paths.CHAT
const VERIFY_EMAIL_URL = paths.VERIFY_EMAIL
import './index.css'
import './App.css'

class App extends React.Component {
	render() {
		return (
			<BrowserRouter>
				<div className='container-fluid h-100'>
					<Route exact path={LOGIN_URL} component={HomePage} />
					<Route path={REGISTER_URL} component={Register} />
					<Route path={CHAT_URL} component={ChatPage}/>
					<Route path={INVALID_EMAIL_URL} component={InvalidEmailPage}/>
					<Route path={VERIFY_EMAIL_URL} component={VerifyEmail}/>
				</div>
			</BrowserRouter>
		)
	}
}

module.exports = App
