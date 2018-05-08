import fetch from 'jest-fetch-mock'
jest.setMock('node-fetch', fetch)

import React from 'react';
import Register from '../../components/register'
import {BrowserRouter as Router} from 'react-router-dom';
import enzyme, {configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import sinon from 'sinon'

/* Using documentation - http://airbnb.io/enzyme/docs/api/shallow.html */ 
let suite = {}
configure({adapter: new Adapter()})

describe('<Register />', () => {
    beforeEach(() => {
        suite.wrapper = mount(<Router><Register /></Router>)
        suite.Component = shallow(<Router><Register /></Router>).find(Register).dive()
    })
    afterEach(() => {
        suite = {}
    })
    it('renders without exploding', () => {
        expect(suite.wrapper.length).toBe(1)
    })
    it('should render three inputs', () => {
       expect(suite.wrapper.find('.user-input').length).toBe(3)
    })
    it('should render one button', () => {
      expect(suite.wrapper.find('.register-button').length).toBe(1)
    })
    it('username should be empty on launch', () => {
        expect(suite.Component.state('username')).toBe('')
    })
    it('password should be empty on launch', () => {
        expect(suite.Component.state('password')).toBe('')
    })
    it('email should be empty on launch', () => {
        expect(suite.Component.state('email')).toBe('')
    })
    it('successfulRegister should be false on launch', () => {
        expect(suite.Component.state('successfulRegister')).toBe(false)
    })
    it('Should change the username state on user input', () => {
        suite.Component.instance().handleChange({target: {name:'username', value: 'dummyInput'}})
        expect(suite.Component.state('username')).toBe('dummyInput')
    })
    it('Should change the password state on user input', () => {
        suite.Component.instance().handleChange({target: {name:'password', value: 'dummyInput'}})
        expect(suite.Component.state('password')).toBe('dummyInput')
    })
    it('Should call registerHandler on event submit', () => {
        const registerHandler = sinon.spy()
        suite.Component.instance().registerHandler = registerHandler
        suite.Component.instance().handleSubmit({preventDefault: () => {}})
        sinon.assert.called(registerHandler)
    })
    it('Should return true if the status code is 200', async done => {
        const fakeUserData = {username: 'dummyUser', password: 'dupa', email: 'Ihatetesting@fetch.com'}
        fetch.mockResponse(JSON.stringify({description:'OK'}))
        await suite.Component.instance().registerHandler(fakeUserData, fetch)
        expect(fetch).toHaveBeenCalled()
        expect(suite.Component.state('successfulRegister')).toBe(true)
        done()
    })
    it('Should return false if the status code is not 200', async done => {
        const fakeUserData = {username: 'dummyUser', password: 'dupa', email: 'Ihatetesting@fetch.com'}
        fetch.mockReject(JSON.stringify({description:'OK'}))
        await suite.Component.instance().registerHandler(fakeUserData, fetch)
        expect(fetch).toHaveBeenCalled()
        expect(suite.Component.state('successfulRegister')).toBe(false)
        done()
    })    
})




