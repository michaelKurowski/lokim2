const winston = require('winston')
const Logger = winston.Logger
const config = require('./config.json')
const path = require('path')
const fs = require('fs')
const consoleOutput = winston.transports.Console
const fileOutput = winston.transports.File
const logsFilePath = path.resolve(`${__dirname}/logs/${config.logging.fileName}`)
const logsDirectoryPath = path.resolve(`${__dirname}/logs/`)


if (!fs.existsSync(logsDirectoryPath)) fs.mkdirSync( logsDirectoryPath )

module.exports = new Logger({
	transports: [
		new consoleOutput({ level: config.logging.logLevel }),
		new fileOutput({filename: logsFilePath})
	]
})
