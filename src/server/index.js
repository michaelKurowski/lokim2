const init = require('./init')


init().catch(error => {
	const FAILURE_EXIT_CODE = 1
	const logger = require('./logger')
	logger.error('Failed to run application: ', error.message, 'for details set logLevel config variable to "debug"')
	logger.debug('Error details', error)
	process.exit(FAILURE_EXIT_CODE)
})
