const fetch = require('jest-fetch-mock')
jest.setMock('node-fetch', fetch)

const React = require('react')
const Register = require('../../components/register')
const {BrowserRouter} = require('react-router-dom')
const {configure, mount, shallow } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const sinon = require('sinon')

const EXPECTED_ELEMENT_COUNT = 1
const EXPECT_THREE_ELEMENTS = 3
const NO_INPUT = ''
const USER_INPUT_CLASS = '.user-input'
const EMAIL = 'email'
const DUMMY_USERNAME = 'dummyUser'
const DUMMY_PASSWORD ='dummyPassword'
const DUMMY_EMAIL = 'Ihatetesting@fetch.com'
const USER_NAME = 'username'
const PASS_WORD = 'password'
const SUCCESSFUL_REGISTER = 'successfulRegister'
const OK = 'OK'

const REGISTER_COMPONENT = <BrowserRouter><Register /></BrowserRouter>
let suite = {}
configure({adapter: new Adapter()})

describe('<Register />', () => {
	beforeEach(() => {
		suite.wrapper = mount(REGISTER_COMPONENT)
		suite.Component = shallow(REGISTER_COMPONENT).find(Register).dive()
	})
	afterEach(() => {
		suite = {}
	})
	describe('<Register /> Render Tests', () => {
		it('renders without exploding', () => {
			const elementsCount = suite.wrapper.render().length
			expect(elementsCount).toBe(EXPECTED_ELEMENT_COUNT)
		})
		it('should render three inputs', () => {
			expect(suite.wrapper.find(USER_INPUT_CLASS).length).toBe(EXPECT_THREE_ELEMENTS)
		})
	})
	describe('<Register /> Initial State Tests', () => {
		it('username should be empty on launch', () => {
			expect(suite.Component.state(USER_NAME)).toBe(NO_INPUT)
		})
		it('password should be empty on launch', () => {
			expect(suite.Component.state(PASS_WORD)).toBe(NO_INPUT)
		})
		it('email should be empty on launch', () => {
			expect(suite.Component.state(EMAIL)).toBe(NO_INPUT)
		})
		it('successfulRegister should be false on launch', () => {
			expect(suite.Component.state(SUCCESSFUL_REGISTER)).toBeFalsy()
		})
	})
	describe('<Register /> Functionality Tests', () => {
		it('Should change the username state on user input', () => {
			const USER_INPUT = 'coolUsername'
			suite.Component.instance().handleChange({target: {name: USER_NAME, value: USER_INPUT}})
			const username = suite.Component.state(USER_NAME)
			expect(username).toBe(USER_INPUT)
		})
		it('Should change the password state on user input', () => {
			const USER_INPUT = 'coolPassword'
			suite.Component.instance().handleChange({target: {name: PASS_WORD, value: USER_INPUT}})
			const password = suite.Component.state(PASS_WORD)
			expect(password).toBe(USER_INPUT)
		})
		it('Should call registerHandler on event submit', () => {
			const registerHandler = sinon.spy()
			suite.Component.instance().registerHandler = registerHandler
			suite.Component.instance().handleSubmit({preventDefault: () => {}})
			sinon.assert.called(registerHandler)
		})
		it('Should set successfulRegister to true if statusCode of register fetch request is 200', async done => {
			const fakeUserData = {username: DUMMY_USERNAME, password: DUMMY_PASSWORD, email: DUMMY_EMAIL}
			fetch.mockResponse(JSON.stringify({description: OK}))
			await suite.Component.instance().registerHandler(fakeUserData, fetch)
			expect(fetch).toHaveBeenCalled()
			expect(suite.Component.state(SUCCESSFUL_REGISTER)).toBeTruthy()
			done()
		})
		it('Should set successfulRegister to true if statusCode of register fetch request is NOT 200', async done => {
			const fakeUserData = {username: DUMMY_USERNAME, password: DUMMY_PASSWORD, email: DUMMY_EMAIL}
			fetch.mockReject(JSON.stringify({description: OK}))
			await suite.Component.instance().registerHandler(fakeUserData, fetch)
			expect(fetch).toHaveBeenCalled()
			expect(suite.Component.state(SUCCESSFUL_REGISTER)).toBeFalsy()
			done()
		})
	})    
})


