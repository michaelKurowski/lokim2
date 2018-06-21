const mongoose = require('mongoose')
const logger = require('./logger')

module.exports = function (username, password, hostname) {
	const db = mongoose.createConnection(`mongodb://${username}:${password}@${hostname}`)
	db.on('error', err => logger.error(`Failed to connect to database with host "${hostname}". Error: ${err}`))
	db.once('open', () => logger.info(`Connected to database: ${hostname}`))
	return db
}