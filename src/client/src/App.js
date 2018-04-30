import './App.css';
const React = require('react')
const HomePage = require('./components/homepage')
const Register = require('./components/register')
const ChatPage = require('./components/chatpage')
const {BrowserRouter, Route} = require('react-router-dom')


class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className='container-fluid'>
          <Route exact path='/' component={HomePage} />
          <Route path='/register' component={Register} />
          <Route path='/chat' component={ChatPage}/>
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
