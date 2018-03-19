const dummyGitHookMessage = require('./dummyGitHookMessage.json')
const _ = require('lodash')

class GitWebHookMocker {
	createMock(sourceBranch) {
		const mock = _.clone(dummyGitHookMessage)
		mock.ref = `refs/heads/${sourceBranch}`
		return mock
	}
}

module.exports = GitWebHookMocker