const fetch = require('jest-fetch-mock')
jest.setMock('node-fetch', fetch)

const React = require('react')
const Register = require('../../components/register')
const {BrowserRouter} = require('react-router-dom')
const {configure, mount, shallow } = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
const sinon = require('sinon')

const EXPECTED_ELEMENTS_COUNT = 1
const OTHER_EXPECTED_ELEMENTS_COUNT = 2
const EXPECT_THREE_ELEMENTS = 3
const MAGIC_STRING = ''
const USER_INPUT = '.user-input'
const REGISTER_BUTTON = '.register_button'
const DUMMY_ROOM = 'dummyRoom'
const DUMMY_USER = 'dummyUser'
const DUMMY_INPUT = 'dummyInput'
const DUMMY_PASSWORD ='dummyPassword'
const DUMMY_EMAIL = 'Ihatetesting@fetch.com'
const USER_NAME = 'username'
const PASS_WORD = 'password'
const SUCCESSFUL_REGISTER = 'successfulRegister'
const FALSE = false
const TRUE = true
const UNDEFINED = undefined
const OK = 'OK'


let suite = {}
configure({adapter: new Adapter()})

describe('<Register />', () => {
    beforeEach(() => {
        suite.wrapper = mount(<BrowserRouter><Register /></BrowserRouter>)
        suite.Component = shallow(<BrowserRouter><Register /></BrowserRouter>).find(Register).dive()
    })
    afterEach(() => {
        suite = {}
    })
    it('renders without exploding', () => {
        expect(suite.wrapper.length).toBe(EXPECTED_ELEMENTS_COUNT)
    })
    it('should render three inputs', () => {
       expect(suite.wrapper.find(USER_INPUT).length).toBe(EXPECT_THREE_ELEMENTS)
    })
    it('should render one button', () => {
      expect(suite.wrapper.find(REGISTER_BUTTON).length).toBe(EXPECTED_ELEMENTS_COUNT)
    })
    it('username should be empty on launch', () => {
        expect(suite.Component.state(USER_NAME)).toBe(MAGIC_STRING)
    })
    it('password should be empty on launch', () => {
        expect(suite.Component.state(PASS_WORD)).toBe(MAGIC_STRING)
    })
    it('email should be empty on launch', () => {
        expect(suite.Component.state('email')).toBe(MAGIC_STRING)
    })
    it('successfulRegister should be false on launch', () => {
        expect(suite.Component.state(SUCCESSFUL_REGISTER)).toBe(FALSE)
    })
    it('Should change the username state on user input', () => {
        suite.Component.instance().handleChange({target: {name: USER_NAME, value: DUMMY_INPUT}})
        expect(suite.Component.state(USER_NAME)).toBe(DUMMY_INPUT)
    })
    it('Should change the password state on user input', () => {
        suite.Component.instance().handleChange({target: {name: PASS_WORD, value: DUMMY_INPUT}})
        expect(suite.Component.state(PASS_WORD)).toBe(DUMMY_INPUT)
    })
    it('Should call registerHandler on event submit', () => {
        const registerHandler = sinon.spy()
        suite.Component.instance().registerHandler = registerHandler
        suite.Component.instance().handleSubmit({preventDefault: () => {}})
        sinon.assert.called(registerHandler)
    })
    it('Should return true if the status code is 200', async done => {
        const fakeUserData = {username: DUMMY_USER, password: DUMMY_PASSWORD, email: DUMMY_EMAIL}
        fetch.mockResponse(JSON.stringify({description: OK}))
        await suite.Component.instance().registerHandler(fakeUserData, fetch)
        expect(fetch).toHaveBeenCalled()
        expect(suite.Component.state(SUCCESSFUL_REGISTER)).toBe(TRUE)
        done()
    })
    it('Should return false if the status code is not 200', async done => {
        const fakeUserData = {username: DUMMY_USER, password: DUMMY_PASSWORD, email: DUMMY_EMAIL}
        fetch.mockReject(JSON.stringify({description: OK}))
        await suite.Component.instance().registerHandler(fakeUserData, fetch)
        expect(fetch).toHaveBeenCalled()
        expect(suite.Component.state(SUCCESSFUL_REGISTER)).toBe(FALSE)
        done()
    })    
})




