const gitMessages = require('./gitMessages')
const logger = require('../logger')
const config = require('../config.json')
const spawnChildProcess = require('child_process').spawn
const path = require('path')

const CURRENT_PATH = path.resolve(__dirname)
const PORT = config.gitIntegration.listeningPort
const BRANCH = config.gitIntegration.branch
const GIT_EVENT_IDENTIFIER_HTTP_HEADER = 'X-GitHub-Event'
const GIT_PUSH_EVENT = 'push'

class GitListener {
	handleHttpRequests(request, response) {
		const branchToListen = `refs/heads/${BRANCH}`
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

	pullBranch(spawn = spawnChildProcess) {
		return new Promise( (resolve, reject) => {
			const COMMAND_CONFIG = {cwd: CURRENT_PATH}
			const ARGUMENTS = ['pull', '--force', 'origin', BRANCH]
			const COMMAND = 'git'

			const gitPull = spawn(COMMAND, ARGUMENTS, COMMAND_CONFIG)

			gitPull.on('error', reject)
			gitPull.on('close', code => {
				if (code !== 0) return reject(`git pull failed, and closed with code: ${code}`)
				resolve()
			})
		})

	}
}

module.exports = GitListener