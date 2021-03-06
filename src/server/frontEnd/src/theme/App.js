const React = require('react')
const HomePage = require('./scenes/homepage/homepage')
const Register = require('./scenes/register/register')
const ChatPage = require('./scenes/chatpage/chatpage')
const {BrowserRouter, Route} = require('react-router-dom')
const {paths} = require('routing-config')
const LOGIN_URL = paths.HOME
const REGISTER_URL = paths.REGISTER
const CHAT_URL = paths.CHAT
import './index.css'
import './App.css'

class App extends React.Component {
	render() {
		return (
			<BrowserRouter>
				<div className='h-full'>
					<Route exact path={LOGIN_URL} component={HomePage} />
					<Route path={REGISTER_URL} component={Register} />
					<Route path={CHAT_URL} component={ChatPage}/>
				</div>
			</BrowserRouter>
		)
	}
}

module.exports = App
