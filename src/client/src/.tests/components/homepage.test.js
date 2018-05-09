import fetch from 'jest-fetch-mock'
jest.setMock('node-fetch', fetch)

import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom';
import HomePage from '../../components/homepage'
import logo from '../../logo.svg'
import {configure, mount, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import sinon from 'sinon'


const EXPECTED_ELEMENTS_COUNT = 1
const OTHER_EXPECTED_ELEMENTS_COUNT = 2
const MAGIC_STRING = ''
const USER_INPUT = '.user-input'
const HOME_BUTTON = '.home_button'
const DUMMY_ROOM = 'dummyRoom'
const DUMMY_USER = 'dummyUser'
const DUMMY_INPUT = 'dummyInput'
const USER_NAME = 'username'
const PASS_WORD = 'password'
const SUCCESSFUL_LOGIN = 'successfulLogin'
const TRUE = true
const FALSE = false
const OK = 'OK'
const BAD = 'BAD'

configure({adapter: new Adapter()})

let suite = {}

describe('<HomePage />', () => {

    beforeEach(() => {
        fetch.resetMocks()
        suite.wrapper = mount(<Router><HomePage /></Router>)
        suite.Component = shallow(<Router><HomePage /></Router>).find(HomePage).dive()
    })
    afterEach(() => {
        suite = {}
    })
    it('renders without exploding', () => {
        expect(suite.wrapper.length).toBe(EXPECTED_ELEMENTS_COUNT)
    })
    it('Should contain two inputs', () => {
        expect(suite.wrapper.find(USER_INPUT).length).toBe(OTHER_EXPECTED_ELEMENTS_COUNT)
    })
    it('Should contain two button', () => {
        expect(suite.wrapper.find(HOME_BUTTON).length).toBe(OTHER_EXPECTED_ELEMENTS_COUNT)
    })
    it('Should contain a logo', () => {
        expect(suite.wrapper.find({src: logo}).length).toBe(EXPECTED_ELEMENTS_COUNT)
    })
    it('Should change the username state on user input', () => {
        suite.Component.instance().handleChange({target: {name: USER_NAME, value: DUMMY_INPUT}})
        expect(suite.Component.state(USER_NAME)).toBe(DUMMY_INPUT)
    })
    it('Should change the password state on user input', () => {
        suite.Component.instance().handleChange({target: {name: PASS_WORD, value: DUMMY_INPUT}})
        expect(suite.Component.state(PASS_WORD)).toBe(DUMMY_INPUT)
    })
    it('Should call the loginhandler on event trigger', () => {
        const loginHandler = sinon.spy()
        suite.Component.instance().loginHandler = loginHandler
        suite.Component.instance().handleSubmit({preventDefault: () => {}})
        sinon.assert.called(loginHandler)
    })
    it('successfulLogin should be false on startup', () => {
        expect(suite.Component.state(SUCCESSFUL_LOGIN)).toBe(FALSE)
    })
    it('username should be empty on launch', () => {
        expect(suite.Component.state(USER_NAME)).toBe(MAGIC_STRING)
    })
    it('password should be empty on launch', () => {
        expect(suite.Component.state(PASS_WORD)).toBe(MAGIC_STRING)
    })
    it('should return true if statusCode is 200', async done => {
        fetch.mockResponse(JSON.stringify({description: OK}))
        await suite.Component.instance().loginHandler(DUMMY_USER, DUMMY_PASSWORD, fetch)
        expect(fetch).toHaveBeenCalled()
        expect(suite.Component.state(SUCCESSFUL_LOGIN)).toBe(TRUE)
        done()
    }); 
    it('should return false if statusCode is NOT 200', async done => {
        fetch.mockReject(JSON.stringify({description: BAD}))
        await suite.Component.instance().loginHandler(DUMMY_USER, DUMMY_PASSWORD, fetch)
        expect(fetch).toHaveBeenCalled()
        expect(suite.Component.state(SUCCESSFUL_LOGIN)).toBe(FALSE)
        done()
    });
})