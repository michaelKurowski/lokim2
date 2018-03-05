const winston = require('winston')
const Logger = winston.Logger
const config = require('./config.json')
const logsFilePath = `./logs/${config.logFile}`

const consoleOutput = winston.transports.Console
const fileOutput = winston.transports.Console

module.exports = new Logger({
	transports: [
		new consoleOutput(),
		new fileOutput({filename: logsFilePath})
	]
})
