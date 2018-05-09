import React from 'react'
import Room from '../../components/room'
import {configure, shallow} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

const EXPECTED_ELEMENT_COUNT = 1
const DUMMY_NAME = 'dummyName'

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
        expect(suite.wrapper.length).toBe(EXPECTED_ELEMENT_COUNT)
    })
    it('renders Room component with parameters', () => {
        suite.wrapper = shallow(<Room name={DUMMY_NAME} ID={123} onClick={() => {}}/>)
        expect(suite.wrapper.length).toBe(EXPECTED_ELEMENT_COUNT)
    })
})