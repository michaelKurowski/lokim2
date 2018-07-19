const mongoose = require('mongoose')
const logger = require('./logger')

module.exports = function (username, password, hostname) {
	if (!username) logger.warn('No username is given for MongoDB connection')
	if (!password) logger.warn('No password is given for MongoDB connection')

	const db = username ?
		mongoose.createConnection(`mongodb://${username}:${password}@${hostname}`) :
		mongoose.createConnection(`mongodb://${hostname}`)
	db.on('error', err => logger.error(`Failed to connect to database with host "${hostname}". Error: ${err}`))
	db.once('open', () => logger.info(`Connected to database: ${hostname}`))
	return db
}