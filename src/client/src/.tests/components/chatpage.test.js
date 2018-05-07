import React from 'react';
import ChatPage from '../../components/chatpage'
import ConnectStatus from '../../components/connectStatus'
import Room from '../../components/room'
import {configure, mount, shallow } from 'enzyme';
import {BrowserRouter as Router} from 'react-router-dom';
import Adapter from 'enzyme-adapter-react-16'
import sessionStorage from 'mock-local-storage'


let suite = {}
global.window = {}

configure({adapter: new Adapter()})

describe('<ChatPage />', () => {
  beforeEach(() => {
    suite.wrapper = mount(<Router><ChatPage location={{state: {username: 'dummyUser'}}}/></Router>)
    suite.Component = shallow(<Router><ChatPage location={{state: {username: 'dummyUser'}}}/></Router>).find(ChatPage).dive()
    window.sessionStorage = global.sessionStorage
  })
  afterEach(() => {
    suite = {}
    window.sessionStorage.clear()

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
  it('Should return change the selected room', () => {
    const dummyRoom = 'dummyRoom'
    suite.Component.instance().changeSelectedRoom({roomId: dummyRoom})
    expect(suite.Component.state('selectedRoom')).toBe(dummyRoom)
  })
  it('Should have no selected room on mount', () => {
    expect(suite.Component.state('selectedRoom')).toBe("")
  })
  it('Should be disconnected at startup', () => {
    expect(suite.Component.state('connected')).toBe(false)
  })
  it('Should have no input at startup', () => {
    expect(suite.Component.state('input')).toBe("")
  })
  it('Should have no messages at startup', () => {
    expect(suite.Component.state('messages').length).toBe(0)
  })
  it('Should have no userRooms at startup', () => {
    expect(suite.Component.state('userRooms').length).toBe(0)
  })
  it('Should have a username at startup', () => {
    expect(suite.Component.state('username')).toBe('dummyUser')
  })
  it('Should update joined rooms', () => {
    const fakeData = {roomId: 'dummyRoom', usernames: 'dummyUser'}
    suite.Component.instance().updateJoinedRooms(fakeData)
    expect(suite.Component.state('userRooms')[0].roomId).toBe(fakeData.roomId)
    expect(suite.Component.state('userRooms')[0].usernames).toBe(fakeData.usernames)
  })
  it('Should store a message to sessionStorage', () => {
    const roomId = 'dummyRoom'
    const fakeData = {username: 'dummyUser', message: 'fakeMessage', timestamp: new Date().getTime()}
    suite.Component.instance().storeMessage(roomId, fakeData)
    const retrievedObject = JSON.parse(window.sessionStorage.getItem(roomId))
    expect(retrievedObject[0].message).toBe(fakeData.message)
    expect(retrievedObject[0].username).toBe(fakeData.username)
    expect(retrievedObject[0].timestamp).toBe(fakeData.timestamp)
  })
  it('Should not update messages to state if the selected room is not the same', () => {
    const roomId = 'dummyRoom'
    const fakeData = {username: 'dummyUser', message: 'fakeMessage', timestamp: new Date().getTime()}
    suite.Component.instance().updateMessageState({roomId, ...fakeData})
    expect(suite.Component.state('messages').length).toBe(0)
  })
  it('Should update messages to state if the selectedroom is the same as the roomId of the message', () => {
    const roomId = 'dummyRoom'
    const fakeData = {username: 'dummyUser', message: 'fakeMessage', timestamp: new Date().getTime()}
    suite.Component.instance().changeSelectedRoom({roomId})
    suite.Component.instance().updateMessageState({roomId, ...fakeData})
    expect(suite.Component.state('messages').length).toBe(1)
  })
  it('Should return no users of room', () => {
      expect(suite.Component.instance().findUsersOfRoom('dummyRoom')).toBe('')
  })
  it('Should return a user in the room', () => {
    suite.Component.instance().updateJoinedRooms({usernames: 'dummyUser', roomId: 'dummyRoom'})
    expect(suite.Component.instance().findUsersOfRoom('dummyRoom')).toBe('dummyUser')
  })
  it('Should generate a warning to select a room first', () => {
    expect(typeof suite.Component.instance().generateMessages())
    .toBe(typeof {})
  })
  it('Should generate nothing if a room is specified and there are no messages to render', () => {
    const roomId = 'dummyRoom'
    suite.Component.instance().changeSelectedRoom({roomId})
    expect(suite.Component.instance().generateMessages()).toBe(undefined)
  })
  it('Should generate a message if a room is specified and there are messages to render', () => {
    const roomId = 'dummyRoom'
    suite.Component.instance().changeSelectedRoom({roomId})
    const msg = {username: 'dummyUser', message: 'fakeMessage', timestamp: new Date().getTime()}
    suite.Component.instance().updateMessageState({roomId, ...msg})
    expect(suite.Component.instance().generateMessages().length).toBe(1)
  })
  it('Should throw an error if the input is empty', () => {
    const roomId = 'dummyRoom'
    suite.Component.instance().changeSelectedRoom({roomId})
    expect(() => suite.Component.instance().sendMessage()).toThrow()
  })
  it('Should throw an error if there is no room selected', () => {
    suite.Component.instance().handleUserInput({ target: { value: 'dummyInput'}})
    expect(() => suite.Component.instance().sendMessage()).toThrow()
  })
  it('Should throw an error if there is no room and there is no input', () => {
    expect(() => suite.Component.instance().sendMessage()).toThrow()
  })
  it('Should add a new message to the state', () => {
    const roomId = 'dummyRoom'
    suite.Component.instance().changeSelectedRoom({roomId})
    suite.Component.instance().handleUserInput({ target: { value: 'dummyInput'}})
    suite.Component.instance().sendMessage()
    expect(suite.Component.state('messages').length).toBe(1)
  })
})