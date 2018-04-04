const mongoose = require('mongoose')
const config = require('./config.json')
const logger = require('./logger')

const db = mongoose.createConnection(`mongodb://${config.database.username}:${config.database.password}@${config.database.host}`)
db.on('error', err => logger.error(`Failed to connect to database: ${err}`))
db.once('open', () => logger.info(`Connected to database: ${config.database.host}`))

module.exports = db