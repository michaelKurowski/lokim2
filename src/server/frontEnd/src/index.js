import './index.css'
import './App.css'
import registerServiceWorker from './registerServiceWorker'
const React  = require('react')
const ReactDOM = require('react-dom')
const App = require('./App')

const {createStore, applyMiddleware, combineReducers} = require('redux')
const {Provider, connect} = require('react-redux')
const roomsManagementReducer = require('./services/roomsManagement/roomsManagement.reducer')
const sessionReducer = require('./services/session/session.reducer')
const {composeWithDevTools} = require('redux-devtools-extension')
const isDevMode = require('../../config.json').devPropeties.devMode
const createSagaMiddleware = require('redux-saga').default
const watchLogIn = require('./services/sagas/logIn.saga').watchLogIn
const webSocketProvider = require('./utils/sockets/ws-routing')
const webSocketListener = require('./services/sagas/webSocketListener.saga').watch
const webSocketEmitter = require('./services/sagas/webSocketEmitters.saga').watch
const sagaMiddleware = createSagaMiddleware()
//const exampleMiddleware = store => next => action => next(action)
const initialMiddleware = [sagaMiddleware]

const middleware = isDevMode ? composeWithDevTools(applyMiddleware(...initialMiddleware)) : applyMiddleware(...initialMiddleware)
const rootReducer = combineReducers({roomsManagementReducer, sessionReducer})
const store = createStore(rootReducer, middleware)
sagaMiddleware.run(webSocketListener)
sagaMiddleware.run(watchLogIn)
sagaMiddleware.run(webSocketEmitter)
ReactDOM.render(
    <Provider store={store} >
        <App/>
    </Provider>
, document.getElementById('root'))
registerServiceWorker()
