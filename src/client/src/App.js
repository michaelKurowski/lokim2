import './App.css';
const React = require('react')
const HomePage = require('./components/homepage')
const Register = require('./components/register')
const ChatPage = require('./components/chatpage')
const {BrowserRouter, Route} = require('react-router-dom')

const LOGIN_URL = '/'
const REGISTER_URL = '/register'
const CHAT_URL = '/chat'

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className='container-fluid'>
          <Route exact path={LOGIN_URL} component={HomePage} />
          <Route path={REGISTER_URL} component={Register} />
          <Route path={CHAT_URL} component={ChatPage}/>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
