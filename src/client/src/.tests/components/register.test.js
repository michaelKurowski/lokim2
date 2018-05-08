import React from 'react';
import Register from '../../components/register'
import {BrowserRouter as Router} from 'react-router-dom';
import enzyme, {configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

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
})




