import React from 'react';
import ReactDOM from 'react-dom';
import HomePage from './homepage'
import logo from '../logo.svg'
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

configure({adapter: new Adapter()})

describe('<HomePage />', () => {
    const wrapper = shallow(<HomePage />)
    it('Should render without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<HomePage />, div);
        ReactDOM.unmountComponentAtNode(div);
    })
    it('Should contain two inputs', () => {
        expect(wrapper.find('.user-input').length).toBe(2)
    })
    it('Should contain two button', () => {
        expect(wrapper.find('.home-button').length).toBe(2)
    })
    it('Should contain a logo', () => {
        expect(wrapper.find({src: logo}).length).toBe(1)
    })
    
})