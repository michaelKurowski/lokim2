const mongoose = require('mongoose')
const config = require('./config.json')
const logger = require('./logger')

const username = process.env.DB_USERNAME || config.database.username
	

const password = process.env.DB_PASSWORD || config.database.password
	
const host =
	process.env.DB_HOSTNAME
	|| config.database.host

const db = mongoose.createConnection(`mongodb://${username}:${password}@${host}`)
db.on('error', err => logger.error(`Failed to connect to database with host "${host}". Error: ${err}`))
db.once('open', () => logger.info(`Connected to database: ${host}`))

module.exports = db