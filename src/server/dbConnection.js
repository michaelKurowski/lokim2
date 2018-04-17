const mongoose = require('mongoose')
const config = require('./config.json')
const logger = require('./logger')
const _ = require('lodash')

const DEFAULT_DATABASE_HOST = 'localhost'

const username = _.trim(config.database.username) ?
	config.database.username :
	process.env.MONGO_INITDB_ROOT_USERNAME

const password = _.trim(config.database.username) ?
	config.database.username :
	process.env.MONGO_INITDB_ROOT_PASSWORD

const host = _.trim(config.database.username) ?
	config.database.username :
	DEFAULT_DATABASE_HOST

const db = mongoose.createConnection(`mongodb://${username}:${password}@${host}`)
db.on('error', err => logger.error(`Failed to connect to database: ${err}`))
db.once('open', () => logger.info(`Connected to database: ${config.database.host}`))

module.exports = db