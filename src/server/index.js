const init = require('./init')
const logger = require('./logger')

init().catch(error => {
	logger.error('Failed to run application: ', error.message, 'for details set LOG_LEVEL OS variable to "debug"')
	logger.debug('Error details', error)
})