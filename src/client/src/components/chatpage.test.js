import React from 'react';
import ChatPage from './chatpage'
import ConnectStatus from './connectStatus'
import Room from './room'
import {configure, mount } from 'enzyme';
import {BrowserRouter as Router} from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16'

let suite = {}
configure({adapter: new Adapter()})

describe('<ChatPage />', () => {
  beforeEach(() => {
    suite.wrapper = mount(<Router><ChatPage location={{state: {username: 'dummyUser'}}}/></Router>)
  })
  afterEach(() => {
    suite = {}
  })
  it('Should render without crashing', () => {
    expect(suite.wrapper.length).toBe(1)
  })
  it('Should have a ConnectStatus component', () => {
    expect(suite.wrapper.find(ConnectStatus).length).toBe(1)
  })
  it('Should have a sidebar', () => {
    expect(suite.wrapper.find('.sidebar').length).toBe(1)
  })
  it('Should have no rooms loaded', () => {
    expect(suite.wrapper.find(Room).length).toBe(0)
  })
  it('Should have a message-area', () => {
    expect(suite.wrapper.find('.message-area').length).toBe(1)
  })
  it('Should have no messages loaded', () => {
    expect(suite.wrapper.find('.message').length).toBe(0)
  })
  it('Should have a logout button', () => {
    expect(suite.wrapper.find('a').length).toBe(1)
  })
  it('Logout button URL should be / ', () => {
    expect(suite.wrapper.find({href: '/'}).length).toBe(1)
  })
})