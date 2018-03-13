const gitMessages = require('./gitMessages')
const logger = require('../logger')
const config = require('../config.json')

const PORT = config.gitIntegration.listeningPort
const GIT_EVENT_IDENTIFIER_HTTP_HEADER = 'X-GitHub-Event'
const GIT_PUSH_EVENT = 'push'

class GitListener {
	handleHttpRequests(request, response) {
		const branchToListen = `refs/heads/${config.gitIntegration.branch}`
		const body = request.body
		const eventType = request.get(GIT_EVENT_IDENTIFIER_HTTP_HEADER)

		if (body.ref !== branchToListen) return response.status(202).send('Accepted')

		if (eventType !== GIT_PUSH_EVENT) {
			logger.info(`${gitMessages.logger.WRONG_EVENT}. Event: ${eventType}`)
			return response.status(400).send('Bad Request')
		}

		logger.info(gitMessages.logger.PUSH_EVENT_RECEIVED)
		return response.send('OK')
	}

	handleListeningErrors(error) {
		if (error) {
			logger.error(`Error during Git monitor's attempt to listen for port ${PORT}`)
			return
		}
		logger.info(`Git monitor is listening on port ${PORT}`)
	}
}

module.exports = GitListener