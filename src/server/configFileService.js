
const CONFIG_FILE_PATH = 'config.json'
const ERROR_DURING_READING_CONFIG = 'Error during reading config file: '
const FILE_NOT_EXISTING = 'ENOENT'
const assert = require('chai').assert
const ERROR_MESSAGES = require('./miscellaneous/configErrorMessages.json')

module.exports = function ({
	fs = require('fs'),
	path = require('path'),
	process = require('process')
} = {}) {
	return {
		isConfigFileExisting() {
			const pathToConfig = path.join(process.cwd(), '/', CONFIG_FILE_PATH)
			return new Promise((resolve, reject) => {
				fs.stat(pathToConfig, err => {
					if (!err) return resolve(true)
					if (err.code === FILE_NOT_EXISTING) return resolve(false)
					reject(new Error(ERROR_DURING_READING_CONFIG + err))
				})
			})
		},
		validateFields(config) {
			validateDatabaseConfig(config.database)
			validateHttpServerConfig(config.httpServer)
			validateLoggingConfig(config.logging)
			validateEmailConfig(config.email)
			validateHostConfig(config.host)
			validateSessionConfig(config.session)
			validateDevPropetiesConfig(config.devPropeties)
		},
		generateConfig() {
			const pathToConfig = path.join(process.cwd(), '/', CONFIG_FILE_PATH)
			return new Promise((resolve, reject) => {
				const configTemplate = require('./miscellaneous/templateConfig.json')
				configTemplate.database.username = process.env.DB_USERNAME || ''
				configTemplate.database.password = process.env.DB_PASSWORD || ''

				const configToGenerate = JSON.stringify(configTemplate, null, '\t')
				fs.writeFile(pathToConfig, configToGenerate, fileWriteError => {
					if (fileWriteError) return reject(fileWriteError)
					resolve()
				})
	

			})
		}
	}
}

function validateDatabaseConfig(database) {
	if (!process.env.DB_HOSTNAME)
		assert.isNotEmpty(database.host, ERROR_MESSAGES.DATABASE.EMPTY_HOSTNAME)
}

function validateHttpServerConfig(httpServer) {
	assert.isNumber(httpServer.port, ERROR_MESSAGES.HTTP_SERVER.WRONG_PORT)
}

function validateHostConfig(host){
	assert.isNotEmpty(host, ERROR_MESSAGES.EMPTY_HOSTNAME)
}

function validateEmailConfig(email){
	assert.isNotEmpty(email.email, ERROR_MESSAGES.EMAIL.EMPTY_EMAIL)
	assert.isNotEmpty(email.password, ERROR_MESSAGES.EMAIL.EMPTY_PASSWORD)
	assert.isNotEmpty(email.hostname, ERROR_MESSAGES.EMAIL.EMPTY_HOST)
	assert.isNumber(email.port, ERROR_MESSAGES.EMAIL.EMPTY_PORT)

}

function validateSessionConfig(session) {
	assert.isNotEmpty(session.secret, ERROR_MESSAGES.SESSION.EMPTY_SECRET)
	assert.isNotEmpty(session.cookieName, ERROR_MESSAGES.SESSION.EMPTY_COOKIE_NAME)
	assert.isBoolean(session.resave, ERROR_MESSAGES.SESSION.WRONG_RESAVE)
	assert.isBoolean(session.saveUninitialized, ERROR_MESSAGES.SESSION.WRONG_SAVE_UNINITIALIZED)
	validateCookieConfig(session.cookie)

	function validateCookieConfig(cookie) {
		assert.isBoolean(cookie.secure, ERROR_MESSAGES.SESSION.COOKIE.WRONG_SECURE)
		assert.isNumber(cookie.maxAge, ERROR_MESSAGES.SESSION.COOKIE.WRONG_MAX_AGE)
	}
}

function validateDevPropetiesConfig(devPropeties) {
	assert.isBoolean(devPropeties.devMode, ERROR_MESSAGES.DEV_PROPETIES.WRONG_DEV_MODE)
	assert.isNumber(devPropeties.httpTestPort, ERROR_MESSAGES.DEV_PROPETIES.WRONG_HTTP_PORT)
}

function validateLoggingConfig(logging) {
	assert.isNotEmpty(logging.fileName, ERROR_MESSAGES.LOGGING.EMPTY_FILENAME)
	assert.isNotEmpty(logging.logLevel, ERROR_MESSAGES.LOGGING.EMPTY_LOG_LEVEL)
}

