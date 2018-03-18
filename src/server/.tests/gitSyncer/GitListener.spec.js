const GitListener = require('../../gitSyncer/GitListener')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const httpMocks = require('node-mocks-http')
const EventEmitter = require('events').EventEmitter
const GitWebHookMocker = require('./GitWebHookMocker')
const sinon = require('sinon')

chai.use(chaiAsPromised)
const assert = chai.assert

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
		beforeEach(() => {
			suite.spawnMock = new EventEmitter()
			suite.spawnMock.stdout = new EventEmitter()

			suite.spawnStub = sinon.stub().returns(suite.spawnMock)
		})

		it('should return a promise', () => {
			//given

			//when
			const functionOutput = suite.gitListener.pullBranch(suite.spawnStub)

			//then
			const isOutputPromise = functionOutput instanceof Promise
			assert.isTrue(isOutputPromise)
		})

		it('should reject promise when command exitting with code 1', () => {
			//given

			//when
			const functionOutput = suite.gitListener.pullBranch(suite.spawnStub)
			suite.spawnMock.emit('close', 1)

			//then
			return assert.isRejected(functionOutput)
		})

		it('should resolve promise when command closing with code 0', () => {
			//given

			//when
			const functionOutput = suite.gitListener.pullBranch(suite.spawnStub)
			suite.spawnMock.emit('close', 0)

			//then
			return assert.isFulfilled(functionOutput)
		})

		it('should resolve promise when error event is being sent', () => {
			//given

			//when
			const functionOutput = suite.gitListener.pullBranch(suite.spawnStub)
			suite.spawnMock.emit('error')

			//then
			return assert.isRejected(functionOutput)
		})
	})
})