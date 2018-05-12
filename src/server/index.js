const init = require('./init')


init().catch(error => {
	const logger = require('./logger')
	logger.error('Failed to run application: ', error.message, 'for details set logLevel config variable to "debug"')
	logger.debug('Error details', error)
})