const GitListener = require('../../gitSyncer/GitListener')
const assert = require('chai').assert
const httpMocks = require('node-mocks-http')
const EventEmitter = require('events').EventEmitter
const GitWebHookMocker = require('./GitWebHookMocker')

let suite = {}

describe('GitListener', () => {
	beforeEach(() => {
		suite = {}
		suite.gitListener = new GitListener()
		suite.URL = '/'
		suite.responseMock = httpMocks.createResponse({
			eventEmitter: EventEmitter
		})
		suite.METHOD = 'POST'
		suite.gitWebHookMocker = new GitWebHookMocker()
	})

	describe('#handleHttpRequests', () => {
		it('should return 202 (Accepted) status when received a push event from unrelated branch', done => {
			//given
			const EVENT_TYPE = 'push'
			const SOURCE_BRANCH = 'unrelated-branch'

			const requestMock = httpMocks.createRequest({
				method: suite.METHOD,
				url: suite.URL,
				headers: {'X-GitHub-Event': EVENT_TYPE},
				params: suite.gitWebHookMocker.createMock(SOURCE_BRANCH)
			})

			suite.responseMock.on('send', then)

			//when
			suite.gitListener.handleHttpRequests(requestMock, suite.responseMock)

			//then
			function then() {
				const responseStatus = suite.responseMock._getStatusCode()
				const EXPECTED_RESPONSE_STATUS = 202
				assert.strictEqual(responseStatus, EXPECTED_RESPONSE_STATUS)
				done()
			}
		})
		
	})

	describe('#handleListeningErrors', () => {

	})

	describe('#pullBranch', () => {

	})
})