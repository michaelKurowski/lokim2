import './index.css'
import './App.css'
import registerServiceWorker from './registerServiceWorker'
const React  = require('react')
const ReactDOM = require('react-dom')
const App = require('./App')


ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
