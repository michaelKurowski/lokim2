import './index.css'
import './App.css'
import registerServiceWorker from './registerServiceWorker'
const React  = require('react')
const ReactDOM = require('react-dom')
const App = require('./theme/App')

const {createStore, applyMiddleware, combineReducers} = require('redux')
const {Provider} = require('react-redux')
const roomsManagementReducer = require('./services/roomsManagement/roomsManagement.reducer')
const sessionReducer = require('./services/session/session.reducer')
const {composeWithDevTools} = require('redux-devtools-extension')
const isDevMode = require('../../config.json').devPropeties.devMode
const createSagaMiddleware = require('redux-saga').default
const watchLogIn = require('./services/sagas/logIn.saga').watchLogIn
const webSocketListener = require('./services/sagas/webSocketListener.saga').watch
const webSocketEmitter = require('./services/sagas/webSocketEmitters.saga').watch
const sagaMiddleware = createSagaMiddleware()
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
