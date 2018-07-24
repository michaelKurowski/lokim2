const React = require('react')
const HomePage = require('./scenes/homepage/homepage')
const Register = require('./scenes/register/register')
const ChatPage = require('./scenes/chatpage/chatpage')
const {BrowserRouter, Route} = require('react-router-dom')
const {paths} = require('./routes/routes')
const LOGIN_URL = paths.HOME
const REGISTER_URL = paths.REGISTER
const CHAT_URL = paths.CHAT

class App extends React.Component {

	componentDidMount(){
		console.log('app props', this.props.store)
	}
	render() {
		return (
			<BrowserRouter>
				<div className='container-fluid h-100'>
					<Route exact path={LOGIN_URL} component={HomePage} />
					<Route path={REGISTER_URL} component={Register} />
					<Route path={CHAT_URL} component={ChatPage}/>
				</div>
			</BrowserRouter>
		)
	}
}

module.exports = App
