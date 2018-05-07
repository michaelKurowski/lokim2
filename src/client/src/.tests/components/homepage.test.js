import React from 'react'
import {BrowserRouter as Router} from 'react-router-dom';
import fetchMock from 'fetch-mock'
import HomePage from '../../components/homepage'
import logo from '../../logo.svg'
import {configure, mount, shallow} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import sinon from 'sinon'



configure({adapter: new Adapter()})
let suite = {}

describe('<HomePage />', () => {
    beforeEach(() => {
        suite.wrapper = mount(<Router><HomePage /></Router>)
        suite.Component = shallow(<Router><HomePage /></Router>).find(HomePage).dive()
    })
    afterEach(() => {
        suite = {}
    })
    it('renders without exploding', () => {
        expect(suite.wrapper.length).toBe(1)
    })
    it('Should contain two inputs', () => {
        expect(suite.wrapper.find('.user-input').length).toBe(2)
    })
    it('Should contain two button', () => {
        expect(suite.wrapper.find('.home-button').length).toBe(2)
    })
    it('Should contain a logo', () => {
        expect(suite.wrapper.find({src: logo}).length).toBe(1)
    })
    it('Should change the username state on user input', () => {
        suite.Component.instance().handleChange({target: {name:'username', value: 'dummyInput'}})
        expect(suite.Component.state('username')).toBe('dummyInput')
    })
    it('Should change the password state on user input', () => {
        suite.Component.instance().handleChange({target: {name:'password', value: 'dummyInput'}})
        expect(suite.Component.state('password')).toBe('dummyInput')
    })
    it('Should call the loginhandler on event trigger', () => {
        const loginHandler = sinon.spy()
        suite.Component.instance().loginHandler = loginHandler
        suite.Component.instance().handleSubmit({preventDefault: () => {}})
        sinon.assert.called(loginHandler)
    })
    it('successfulLogin should be false on startup', () => {
        expect(suite.Component.state('successfulLogin')).toBe(false)
    })
    it('username should be empty on launch', () => {
        expect(suite.Component.state('username')).toBe('')
    })
    it('password should be empty on launch', () => {
        expect(suite.Component.state('password')).toBe('')
    })    
    it('successfulLogin to be false with statusCode other than 200', () => {
        fetchMock.post('/login', 400);
        suite.Component.instance().loginHandler('dummyUser', 'dummyPassword')
        expect(suite.Component.state('successfulLogin')).toBe(false)
    })
})