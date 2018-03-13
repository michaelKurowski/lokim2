const winston = require('winston')
const Logger = winston.Logger
const config = require('./config.json')
const path = require('path')
const logsFilePath = path.resolve(`${__dirname}/logs/${config.logFile}`)

const consoleOutput = winston.transports.Console
const fileOutput = winston.transports.File

module.exports = new Logger({
	transports: [
		new consoleOutput(),
		new fileOutput({filename: logsFilePath})
	]
})
