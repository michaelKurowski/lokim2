const {createStore, applyMiddleware, combineReducers} = require('redux')
const {composeWithDevTools} = require('redux-devtools-extension')

//SAGA
const createSagaMiddleware = require('redux-saga').default
const watchLogIn = require('./services/sagas/logIn.saga').watchLogIn
const webSocketListener = require('./services/sagas/webSocketListener.saga').watch
const webSocketEmitter = require('./services/sagas/webSocketEmitters.saga').watch

//REDUCERS
const roomsManagementReducer = require('./services/roomsManagement/roomsManagement.reducer')
const sessionReducer = require('./services/session/session.reducer')

const isDevMode = require('../../config.json').devPropeties.devMode

function initializeRedux() {
    const sagaMiddleware = createSagaMiddleware()
    const initialMiddleware = [sagaMiddleware]
    
    const middleware = isDevMode ? composeWithDevTools(applyMiddleware(...initialMiddleware)) : applyMiddleware(...initialMiddleware)
    const rootReducer = combineReducers({roomsManagementReducer, sessionReducer})
    const store = createStore(rootReducer, middleware)
    sagaMiddleware.run(webSocketListener)
    sagaMiddleware.run(watchLogIn)
    sagaMiddleware.run(webSocketEmitter)

    return store
}

module.exports = initializeRedux