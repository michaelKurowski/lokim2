import './App.css';
const React = require('react')
const HomePage = require('./components/homepage')
const {BrowserRouter, Route} = require('react-router-dom')


class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className='container-fluid'>
          <Route exact path='/' component={HomePage} />
        </div>
      </BrowserRouter>
    )
  }
}

export default App;
