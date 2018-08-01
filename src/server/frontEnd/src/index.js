
import registerServiceWorker from './registerServiceWorker'
const React  = require('react')
const ReactDOM = require('react-dom')
const App = require('./theme/App')

const {Provider} = require('react-redux')
const initializeRedux = require('./initializeRedux')

const store = initializeRedux()

ReactDOM.render(
    <Provider store={store} >
        <App/>
    </Provider>
, document.getElementById('root'))
registerServiceWorker()
