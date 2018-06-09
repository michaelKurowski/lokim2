const mongoose = require('mongoose')
const config = require('./config.json')
const logger = require('./logger')

const DEFAULT_DATABASE_HOST = 'localhost'

const username = process.env.MONGO_INITDB_ROOT_USERNAME ?
	process.env.MONGO_INITDB_ROOT_USERNAME
	: config.database.username
	

const password = process.env.MONGO_INITDB_ROOT_PASSWORD ?
	process.env.MONGO_INITDB_ROOT_PASSWORD
	: config.database.password
	
const host =
	process.env.DEFAULT_DATABASE_HOST
	|| config.database.host
	|| DEFAULT_DATABASE_HOST

const db = mongoose.createConnection(`mongodb://${username}:${password}@${host}`)
db.on('error', err => logger.error(`Failed to connect to database with host "${host}". Error: ${err}`))
db.once('open', () => logger.info(`Connected to database: ${host}`))

module.exports = db