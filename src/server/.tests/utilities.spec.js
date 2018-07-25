const Utilities = require('../utilities')
const assert = require('chai').assert
const ConnectionsRepository = require('../ws-routes/ConnectionsRepository')
const sinon = require('sinon')
let suite = null

describe('utilities.js', () => {
	beforeEach(() => {
		suite = {}
	})
	afterEach(() => {
		suite = null
	})

	describe('#createSaltedHash()', () => {
		beforeEach(() => {
			suite.DUMMY_PASSPHRASE = 'imADummyPassphrase321'
			suite.DUMMY_SALT = 'imADummySalt321'
		})

		it('should return null when no arguments are passed', () => {
			//given
			
			//when
			const generatedHash = Utilities.createSaltedHash()

			//then
			assert.isNull(generatedHash)
		})

		it('should return null when no passphrase is passed', () => {
			//given
			const salt = suite.DUMMY_SALT
			
			//when
			const generatedHash = Utilities.createSaltedHash(salt)

			//then
			assert.isNull(generatedHash)
		})

		it('should return string when correct passphrase and salt are passed', () => {
			//given
			const salt = suite.DUMMY_SALT
			const passphrase = suite.DUMMY_PASSPHRASE
			
			//when
			const generatedHash = Utilities.createSaltedHash(salt, passphrase)

			//then
			assert.isString(generatedHash)
		})
	})

	describe('#generateSalt()', () => {
		beforeEach(() => {
			suite.DUMMY_SALT_SIZE = 60
		})

		it('should return null when no salt size is given', () => {
			//given

			//when
			const generatedSalt = Utilities.generateSalt()

			//then
			assert.isNull(generatedSalt)
		})

		it('should return string', () => {
			//given
			const saltSize = suite.DUMMY_SALT_SIZE

			//when
			const generatedSalt = Utilities.generateSalt(saltSize)

			//then
			assert.isString(generatedSalt)
		})

		it('should return different value every time', () => {
			//given
			const saltSize = suite.DUMMY_SALT_SIZE

			//when
			const generatedSalt1 = Utilities.generateSalt(saltSize)
			const generatedSalt2 = Utilities.generateSalt(saltSize)

			//then
			assert.notStrictEqual(generatedSalt1, generatedSalt2)
		})
	})
	
	describe('#createWebsocketRoute()', () => {
		beforeEach(() => {
			suite.socketMock = {on: sinon.stub()}
			suite.ioMock = {}
			suite.ioMock.of = sinon.stub().returns(suite.ioMock)
			suite.ioMock.on = (namespace, callback) => callback(suite.socketMock)
			suite.connectionsRepository = new ConnectionsRepository()
		})

		it('should throw error about lack of  event type handler when there\'s no event type handler for described event type in protocol', () => {
			//given
			suite.controllersBundle = class {}
			suite.protocol = {
				dummyNamespace: {
					name: 'dummyNamespace',
					eventTypes: {
						COOL_EVENT_TYPE: 'coolEventType'
					}
				}
			}

			const thisBind = null

			const functionCallToTest = 
				Utilities.createWebsocketRoute.bind(
					thisBind,
					suite.ioMock,
					suite.protocol.dummyNamespace,
					suite.controllersBundle,
					suite.connectionsRepository
				)

			//then
			const EXPECTED_ERROR_MESSAGE = 'Can\'t find event "coolEventType" in controller of namespace "dummyNamespace"'
			assert.throws(functionCallToTest, Error, EXPECTED_ERROR_MESSAGE)	
		})

		it('should not throw error about lack of event type handler when there\'s event type handler for described event type in protocol', () => {
			//given
			suite.controllersBundle = class {
				coolEventType() {

				}
			}
			suite.protocol = {
				dummyNamespace: {
					name: 'dummyNamespace',
					eventTypes: {
						COOL_EVENT_TYPE: 'coolEventType'
					}
				}
			}

			const thisBind = null

			const functionCallToTest = 
				Utilities.createWebsocketRoute.bind(
					thisBind,
					suite.ioMock,
					suite.protocol.dummyNamespace,
					suite.controllersBundle,
					suite.connectionsRepository
				)

			//then
			const EXPECTED_ERROR_MESSAGE = 'Can\'t find event "coolEventType" in controller of namespace "dummyNamespace"'
			assert.doesNotThrow(functionCallToTest, Error, EXPECTED_ERROR_MESSAGE)	
		})

		it('should invoke connection event handler with socket and connections map during creating a routing for new incoming connection', () => {
			//given
			const controllerInstanceMock = {connection() {}}
			suite.controllersBundle = sinon.stub().returns(controllerInstanceMock)

			sinon.spy(controllerInstanceMock, 'connection')
			suite.protocol = {
				dummyNamespace: {
					name: 'dummyNamespace',
					eventTypes: {
						CONNECTION: 'connection'
					}
				}
			}


			Utilities.createWebsocketRoute(
				suite.ioMock,
				suite.protocol.dummyNamespace,
				suite.controllersBundle,
				suite.connectionsRepository
			)

			//then
			sinon.assert.calledWith(controllerInstanceMock.connection, suite.socketMock, suite.connectionsRepository)
		})
	})
})