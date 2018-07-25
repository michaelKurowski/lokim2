const {createStore} = require('redux')

let store

function create(...args) {
    store = createStore(...args)
    return store
}

function get() {
    return store
}

module.exports = {
    create,
    get
}