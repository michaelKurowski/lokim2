import './index.css'
const React  = require('react')
const ReactDOM = require('react-dom')
const App = require('./App')
const registerServiceWorker = require('./registerServiceWorker')

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
