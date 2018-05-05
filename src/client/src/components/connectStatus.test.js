import React from 'react';
import ReactDOM from 'react-dom';
import ConnectStatus from './connectStatus'
import { shallow, configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

configure({adapter: new Adapter()})

describe('<ConnectStatus />', () => {
    it('Should render without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<ConnectStatus />, div);
        ReactDOM.unmountComponentAtNode(div);
    })
    it('Should return connected with truthy prop', () => {
        const wrapper = shallow(<ConnectStatus connection={true} />)
        expect(wrapper.find('.success').length).toBe(1)
    })
    it('Should return disconnected with falsey prop', () => {
        const wrapper = shallow(<ConnectStatus connection={false} />)
        expect(wrapper.find('.disconnect').length).toBe(1)
    })
    it('Should return disconnected with no prop', () => {
        const wrapper = shallow(<ConnectStatus />)
        expect(wrapper.find('.disconnect').length).toBe(1)
    })
})