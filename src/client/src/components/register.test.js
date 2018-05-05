import React from 'react';
import ReactDOM from 'react-dom';
import Register from './register'
import enzyme, { shallow, configure, mount } from 'enzyme';
import sinon from 'sinon';
import Adapter from 'enzyme-adapter-react-16'

/* Using documentation - http://airbnb.io/enzyme/docs/api/shallow.html */ 

configure({adapter: new Adapter()})

describe('<Register />', () => {
    const wrapper = shallow(<Register />)
    it('Should render the register component without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<Register />, div);
        ReactDOM.unmountComponentAtNode(div);
    })
    it('should render three inputs', () => {
       expect(wrapper.find('.user-input').length).toBe(3)
    })
    it('should render one button', () => {
      expect(wrapper.find('.register-button').length).toBe(1)
    })   

})




