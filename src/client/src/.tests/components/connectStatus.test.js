import React from 'react';
import ConnectStatus from '../../components/connectStatus'
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'


let suite = {}
configure({adapter: new Adapter()})

describe('<ConnectStatus />', () => {
    beforeEach(() => {
        suite.wrapper = shallow(<ConnectStatus />)
    })
    afterEach(() => {
        suite = {}
    })
    it('Should render without crashing', () => {
        expect(suite.wrapper.length).toBe(1)
    })
    it('Should return disconnected with falsey prop', () => {
        suite.wrapper = shallow(<ConnectStatus connection={false}/>)
        expect(suite.wrapper.find('.disconnect').length).toBe(1)
    })
    it('Should return disconnected with no prop', () => {
        expect(suite.wrapper.find('.disconnect').length).toBe(1)
    })
    it('Should return connected with truthy prop', () => {
        suite.wrapper = shallow(<ConnectStatus connection={true}/>)
        expect(suite.wrapper.find('.success').length).toBe(1)
    })
})