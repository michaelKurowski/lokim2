const ERROR_MESSAGES = require('../miscellaneous/configErrorMessages.json')
const configFileServiceProvider = require('../configFileService')
const sinon = require('sinon')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
const assert = chai.assert


let suite = {}
describe('Config file service', () => {
	beforeEach(() => {
		suite = {}
	})

	describe('#generateConfig()', () => {
		beforeEach(() => {
			const fileWriteError = new Error()
			suite.fsMockSuccessful = {
				writeFile: sinon.stub().callsFake(
					(pathToConfig, configToGenerate, callback) => callback()
				)
			}
			suite.fsMockFailing = {
				writeFile: sinon.stub().callsFake(
					(pathToConfig, configToGenerate, callback) => callback(fileWriteError)
				)
			}

			suite.pathMock = {
				join: sinon.stub()
			}
		})

		it('should reject a promise in case of file write errors', () => {
			const configFileService = configFileServiceProvider({
				fs: suite.fsMockFailing,
				path: suite.pathMock
			})
			return assert.isRejected(configFileService.generateConfig())
		})

		it('should resolve a promise in case of no errors', () => {
			const configFileService = configFileServiceProvider({
				fs: suite.fsMockSuccessful,
				path: suite.pathMock
			})
			return assert.isFulfilled(configFileService.generateConfig())
		})
	})

	describe('#isConfigFileExisting()', () => {
		beforeEach(() => {

			const UNRECOGNIZED_ERROR = 'unrecognized error'
			const FILE_NOT_EXISTING = {
				code: 'ENOENT'
			}
			const NO_ERROR = null
			const NO_STAT = null

			const statMock = {}

			const statSuccessful = sinon.stub().callsFake(
				(path, callback) => callback(NO_ERROR, statMock)
			)
			
			const statStubError = sinon.stub().callsFake(
				(path, callback) => callback(UNRECOGNIZED_ERROR, NO_STAT)
			)

			const statStubFileNotExisting = sinon.stub().callsFake(
				(path, callback) => callback(FILE_NOT_EXISTING, NO_STAT)
			)

			suite.fsMockError = {
				stat: statStubError
			}

			suite.fsMockFileNotExist = {
				stat: statStubFileNotExisting
			}

			suite.fsSuccessful = {
				stat: statSuccessful
			}

			suite.pathMock = {
				join: sinon.stub().returns('DUMMY_PATH')
			}
		})

		it('should eventually false when config file is not found', () => {
			const configFileService = configFileServiceProvider({
				path: suite.pathMock,
				fs: suite.fsMockFileNotExist
			})
			const NO_FILE_FOUND = false

			return assert.eventually.equal(configFileService.isConfigFileExisting(), NO_FILE_FOUND)
		})

		it('should reject promise when config file is not found', () => {
			const configFileService = configFileServiceProvider({
				path: suite.pathMock,
				fs: suite.fsMockError
			})

			return assert.isRejected(configFileService.isConfigFileExisting())
		})

		it('should resolve with true when file is found', () => {
			const configFileService = configFileServiceProvider({
				path: suite.pathMock,
				fs: suite.fsSuccessful
			})

			const FILE_FOUND = true

			return assert.eventually.equal(configFileService.isConfigFileExisting(), FILE_FOUND)
		})
	})

	describe('#validateFields()', () => {
		beforeEach(() => {
			suite.configFileService = configFileServiceProvider()
			suite.configMock = {
				database: {
					username: 'Rick',
					password: 'ImSecret',
					host: 'rickCouncil.com'
				},
				logging: {
					fileName: 'logs.log',
					logLevel: 'warn'
				},
				httpServer: {
					port: 5000
				},
				session: {
					secret: 'jetFuelCantMeltSteelBeams',
					cookieName: 'connection.sid',
					resave: false,
					saveUninitialized: true,
					cookie: {
						secure: false,
						maxAge: 900000
					}
				},
				devPropeties: {
					devMode: false,
					httpTestPort: 5001
				}
			}
			suite.invokeValidateFields = 
				() => suite.configFileService.validateFields(suite.configMock)
		})

		it('should pass when config fullfils requirments', () => {
			assert.doesNotThrow(suite.invokeValidateFields)
		})
	
		describe('Database settings', () => {
			it('should throw error when username is empty', () => {
				suite.configMock.database.username = ''
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.DATABASE.EMPTY_USERNAME)
			})

			it('should throw error when password is empty', () => {
				suite.configMock.database.password = ''
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.DATABASE.EMPTY_PASSWORD)
			})
		})
	
		describe('Http server settings', () => {
			it('should throw error when port is not a number', () => {
				suite.configMock.httpServer.port = null
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.HTTP_SERVER.WRONG_PORT)
			})
		})
	
		describe('Logging settings', () => {
			it('should throw error when log filename is empty', () => {
				suite.configMock.logging.fileName = ''
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.LOGGING.EMPTY_FILENAME)
			})

			it('should throw error when log level is empty', () => {
				suite.configMock.logging.logLevel = ''
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.EMPTY_LOG_LEVEL)
			})
		})
	
		describe('Session settings', () => {
			it('should throw error when cookie name is empty', () => {
				suite.configMock.session.cookieName = ''
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.SESSION.EMPTY_COOKIE_NAME)
			})

			it('should throw error when secret is empty', () => {
				suite.configMock.session.secret = ''
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.SESSION.EMPTY_SECRET)
			})

			it('should throw error when resave option is not boolean', () => {
				suite.configMock.session.resave = null
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.SESSION.WRONG_RESAVE)
			})

			it('should throw error when save uninitialized option is not boolean', () => {
				suite.configMock.session.saveUninitialized = null
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.SESSION.WRONG_SAVE_UNINITIALIZED)
			})

			describe('Cookie settings', () => {
				it('should throw error when secure option is not boolean', () => {
					suite.configMock.session.cookie.secure = null
					assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.SESSION.COOKIE.WRONG_SECURE)
				})
	
				it('should throw error when max age option is not number', () => {
					suite.configMock.session.cookie.maxAge = null
					assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.SESSION.COOKIE.WRONG_MAX_AGE)
				})
			})
		})
	
		describe('Dev settings', () => {
			it('should throw error when devMode option is not boolean', () => {
				suite.configMock.devPropeties.devMode = null
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.DEV_PROPETIES.WRONG_DEV_MODE)
			})

			it('should throw error when http test port option is not number', () => {
				suite.configMock.devPropeties.httpTestPort = null
				assert.throws(suite.invokeValidateFields, ERROR_MESSAGES.DEV_PROPETIES.WRONG_HTTP_PORT)
			})
		})
	})

})