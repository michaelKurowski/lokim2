const fetch = require('jest-fetch-mock')
jest.setMock('node-fetch', fetch)

const React = require('react')
const {BrowserRouter} = require('react-router-dom')
const HomePage = require('../../components/homepage')
const logo = require('../../logo.svg')
const {configure, mount, shallow} = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const sinon = require('sinon')


const EXPECTED_ELEMENT_COUNT = 1
const EXPECT_TWO_ELEMENTS = 2
const INTIAL_INPUT = ''
const USER_INPUT = '.user-input'
const HOME_BUTTON = '.home-button'
const DUMMY_USER = 'dummyUser'
const DUMMY_PASSWORD ='dummyPassword'
const DUMMY_INPUT = 'dummyInput'
const USER_NAME = 'username'
const PASS_WORD = 'password'
const SUCCESSFUL_LOGIN = 'successfulLogin'
const OK = 'OK'
const BAD = 'BAD'

configure({adapter: new Adapter()})

let suite = {}
const HOMEPAGE_COMPONENT = <BrowserRouter><HomePage /></BrowserRouter>
describe('<HomePage />', () => {

	beforeEach(() => {
		fetch.resetMocks()
		suite.wrapper = mount(HOMEPAGE_COMPONENT)
		suite.Component = shallow(HOMEPAGE_COMPONENT).find(HomePage).dive()
	})
	afterEach(() => {
		suite = {}
	})
	describe('<HomePage /> Render Tests', () => {
		it('renders without crashing', () => {
			const elementsCount = suite.wrapper.render().length
			expect(elementsCount).toBe(EXPECTED_ELEMENT_COUNT)
		})
		it('Should contain two inputs', () => {
			expect(suite.wrapper.find(USER_INPUT).length).toBe(EXPECT_TWO_ELEMENTS)
		})
		it('Should contain two button', () => {
			expect(suite.wrapper.find(HOME_BUTTON).length).toBe(EXPECT_TWO_ELEMENTS)
		})
		it('Should contain a logo', () => {
			expect(suite.wrapper.find({src: logo}).length).toBe(EXPECTED_ELEMENT_COUNT)
		})
	})
	describe('<HomePage /> Initial State Tests', () => {
		it('successfulLogin should be false on startup', () => {
			expect(suite.Component.state(SUCCESSFUL_LOGIN)).toBeFalsy()
		})
		it('username should be empty on launch', () => {
			expect(suite.Component.state(USER_NAME)).toBe(INTIAL_INPUT)
		})
		it('password should be empty on launch', () => {
			expect(suite.Component.state(PASS_WORD)).toBe(INTIAL_INPUT)
		})
	})
	describe('<HomePage /> Functionality Tests', () => {
		it('Should change the username state when users changes his name', () => {
			suite.Component.instance().handleChange({target: {name: USER_NAME, value: DUMMY_INPUT}})
			expect(suite.Component.state(USER_NAME)).toBe(DUMMY_INPUT)
		})
		it('Should change the password state when users changes his password', () => {
			suite.Component.instance().handleChange({target: {name: PASS_WORD, value: DUMMY_INPUT}})
			expect(suite.Component.state(PASS_WORD)).toBe(DUMMY_INPUT)
		})
		it('Should call the loginhandler on event trigger', () => {
			const loginHandler = sinon.spy()
			suite.Component.instance().loginHandler = loginHandler
			suite.Component.instance().handleSubmit({preventDefault: () => {}})
			sinon.assert.called(loginHandler)
		})
		
		it('Should set successfulLogin to true if statusCode of login fetch request is 200', async done => {
			fetch.mockResponse(JSON.stringify({description: OK}))
			await suite.Component.instance().loginHandler(DUMMY_USER, DUMMY_PASSWORD, fetch)
			expect(fetch).toHaveBeenCalled()
			expect(suite.Component.state(SUCCESSFUL_LOGIN)).toBeTruthy()
			done()
		}) 
		it('Should keep successfulLogin as false if statusCode of login fetch is NOT 200', async done => {
			fetch.mockReject(JSON.stringify({description: BAD}))
			await suite.Component.instance().loginHandler(DUMMY_USER, DUMMY_PASSWORD, fetch)
			expect(fetch).toHaveBeenCalled()
			expect(suite.Component.state(SUCCESSFUL_LOGIN)).toBeFalsy()
			done()
		})
	})
})