const mongoose = require('mongoose')
const config = require('./config.json')

const db = mongoose.createConnection(`mongodb://${config.database.username}:${config.database.password}@${config.database.host}`)
db.on('error', (err) => {
    console.log(err)
    throw 'Failed to connect to database'
})
db.once('open', ()=>console.log('Connected to DB'))

module.exports = db