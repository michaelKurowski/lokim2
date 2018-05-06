import React from 'react';
import Register from './register'
import enzyme, { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

/* Using documentation - http://airbnb.io/enzyme/docs/api/shallow.html */ 
let suite = {}
configure({adapter: new Adapter()})

describe('<Register />', () => {
    beforeEach(() => {
        suite.wrapper = shallow(<Register />)
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

})




