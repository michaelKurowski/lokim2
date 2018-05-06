import React from 'react'
import Room from './room'
import {configure, shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

let suite = {}
configure({adapter: new Adapter()})

describe('<Room />', () => {
    beforeEach(() => {
        suite.wrapper = shallow(<Room />)
    })
    afterEach(() => {
        suite = {}
    })
    it('renders with no props without exploding', () => {
        expect(suite.wrapper.length).toBe(1)
    })
    it('renders Room component with parameters', () => {
        suite.wrapper = shallow(<Room name='dummyName' ID={123} onClick={() => {}}/>)
        expect(suite.wrapper.length).toBe(1)
    })
})