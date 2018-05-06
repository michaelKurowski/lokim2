import React from 'react'
import HomePage from './homepage'
import logo from '../logo.svg'
import {configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

configure({adapter: new Adapter()})
let suite = {}

describe('<HomePage />', () => {
    beforeEach(() => {
        suite.wrapper = shallow(<HomePage />)
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
    
})