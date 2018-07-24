import './index.css'
import './App.css'
import registerServiceWorker from './registerServiceWorker'
const React  = require('react')
const ReactDOM = require('react-dom')
const App = require('./App')

const {createStore, applyMiddleware, combineReducers} = require('redux')
const {Provider, connect} = require('react-redux')
const roomReducer = require('./services/room/room.reducer')
const sessionReducer = require('./services/session/session.reducer')
const {composeWithDevTools} = require('redux-devtools-extension')
const isDevMode = require('../../config.json').devPropeties.devMode
const thunkMiddleware = require('redux-thunk').default


//const exampleMiddleware = store => next => action => next(action)
const middleware = isDevMode ? composeWithDevTools(applyMiddleware(thunkMiddleware)) : applyMiddleware(thunkMiddleware)
const rootReducer = combineReducers({roomReducer, sessionReducer})
const store = createStore(rootReducer, middleware)
ReactDOM.render(
    <Provider store={store} >
        <App/>
    </Provider>
, document.getElementById('root'))
registerServiceWorker()
