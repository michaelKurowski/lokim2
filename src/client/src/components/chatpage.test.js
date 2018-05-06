import React from 'react';
import ChatPage from './chatpage'
import {configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'

let suite = {}
configure({adapter: new Adapter()})

describe('<ChatPage />', () => {
  beforeEach(() => {
    suite.wrapper = mount(<ChatPage location={{state: {username: 'dummyUser'}}}/>)
  })
  afterEach(() => {
    suite = {}
  })
  it('Should render without crashing', () => {
    expect(suite.wrapper.length).toBe(1)
  })
})