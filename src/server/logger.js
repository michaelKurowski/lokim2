const winston = require('winston')
const config = require('./config.json')

module.exports = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)(),
		new (winston.transports.File)({ filename: `./logs/${config.logFile}` })
	]
})
