const React = require('react')
const ChatPage = require('../../components/chatpage')
const ConnectStatus = require('../../components/connectStatus')
const Room = require('../../components/room')
const {configure, mount, shallow } = require('enzyme')
const {BrowserRouter} = require('react-router-dom')
const Adapter = require('enzyme-adapter-react-16')
const DUMMY_ROOM = 'dummyRoom'
const DUMMY_USER = 'dummyUser'
const USERROOMS = 'userRooms'
const DUMMY_MESSAGE = 'fakeMessage'
const MESSAGES = 'messages'
const SIDEBAR = '.sidebar'
const USERNAME = 'username'
const MESSAGE_AREA = '.message-area'
const SELECTED_ROOM = 'selectedRoom'
const MESSAGE_CLASS = '.message'
const DUMMY_INPUT = 'dummyInput'
const CONNECTED = 'connected'
const INPUT = 'input'
const HOME_PATH = '/'
const EXPECTED_ELEMENTS_COUNT = 1
const ZERO_INDEX = 0
const EXPECT_NOTHING = 0
const EMPTY_MAGIC_STRING = ''
const FALSE = false
const UNDEFINED = undefined
/* eslint-disable no-undef */
const sessionStorage = require('mock-local-storage')
/* eslint-enable no-undef */
let suite = {}
global.sessionStorage = sessionStorage
global.window = {}


configure({adapter: new Adapter()})

describe('<ChatPage />', () => {
	beforeEach(() => {
		suite.wrapper = mount(<BrowserRouter><ChatPage location={{state: {username: DUMMY_USER}}}/></BrowserRouter>)
		suite.Component = shallow(<BrowserRouter><ChatPage location={{state: {username: DUMMY_USER}}}/></BrowserRouter>).find(ChatPage).dive()
		window.sessionStorage = global.sessionStorage
	})
	afterEach(() => {
		suite = {}
		window.sessionStorage.clear()

	})
	it('Should render without crashing', () => {
		expect(suite.wrapper.length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should have a ConnectStatus component', () => {
		expect(suite.wrapper.find(ConnectStatus).length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should have a sidebar', () => {
		expect(suite.wrapper.find(SIDEBAR).length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should have no rooms loaded', () => {
		expect(suite.wrapper.find(Room).length).toBe(EXPECT_NOTHING)
	})
	it('Should have a message-area', () => {
		expect(suite.wrapper.find(MESSAGE_AREA).length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should have no messages loaded', () => {
		expect(suite.wrapper.find(MESSAGE_CLASS).length).toBe(EXPECT_NOTHING)
	})
	it('Should have a logout button', () => {
		expect(suite.wrapper.find('a').length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Logout button URL should be / ', () => {
		expect(suite.wrapper.find({href: HOME_PATH}).length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should return change the selected room', () => {
 
		suite.Component.instance().changeSelectedRoom({roomId: DUMMY_ROOM})
		expect(suite.Component.state(SELECTED_ROOM)).toBe(DUMMY_ROOM)
	})
	it('Should have no selected room on mount', () => {
		expect(suite.Component.state(SELECTED_ROOM)).toBe(EMPTY_MAGIC_STRING)
	})
	it('Should be disconnected at startup', () => {
		expect(suite.Component.state(CONNECTED)).toBe(FALSE)
	})
	it('Should have no input at startup', () => {
		expect(suite.Component.state(INPUT)).toBe(EMPTY_MAGIC_STRING)
	})
	it('Should have no messages at startup', () => {
		expect(suite.Component.state(MESSAGES).length).toBe(EXPECT_NOTHING)
	})
	it('Should have no userRooms at startup', () => {
		expect(suite.Component.state(USERROOMS).length).toBe(EXPECT_NOTHING)
	})
	it('Should have a username at startup', () => {
		expect(suite.Component.state(USERNAME)).toBe(DUMMY_USER)
	})
	it('Should update joined rooms', () => {
		const fakeData = {roomId: DUMMY_ROOM, usernames: DUMMY_USER}
		suite.Component.instance().updateJoinedRooms(fakeData)
		expect(suite.Component.state(USERROOMS)[0].roomId).toBe(fakeData.roomId)
		expect(suite.Component.state(USERROOMS)[0].usernames).toBe(fakeData.usernames)
	})
	it('Should store a message to sessionStorage', () => {
		const roomId = DUMMY_ROOM
		const fakeData = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: new Date().getTime()}
		suite.Component.instance().storeMessage(roomId, fakeData)
		const retrievedObject = JSON.parse(window.sessionStorage.getItem(roomId))
		expect(retrievedObject[ZERO_INDEX].message).toBe(fakeData.message)
		expect(retrievedObject[ZERO_INDEX].username).toBe(fakeData.username)
		expect(retrievedObject[ZERO_INDEX].timestamp).toBe(fakeData.timestamp)
	})
	it('Should not update messages to state if the selected room is not the same', () => {
		const roomId = DUMMY_ROOM
		const fakeData = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: new Date().getTime()}
		suite.Component.instance().updateMessageState({roomId, ...fakeData})
		expect(suite.Component.state(MESSAGES).length).toBe(EXPECT_NOTHING)
	})
	it('Should update messages to state if the selectedroom is the same as the roomId of the message', () => {
		const roomId = DUMMY_ROOM
		const fakeData = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: new Date().getTime()}
		suite.Component.instance().changeSelectedRoom({roomId})
		suite.Component.instance().updateMessageState({roomId, ...fakeData})
		expect(suite.Component.state(MESSAGES).length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should return no users of room', () => {
		expect(suite.Component.instance().findUsersOfRoom(DUMMY_ROOM)).toBe(EMPTY_MAGIC_STRING)
	})
	it('Should return a user in the room', () => {
		suite.Component.instance().updateJoinedRooms({usernames: DUMMY_USER, roomId: DUMMY_ROOM})
		expect(suite.Component.instance().findUsersOfRoom(DUMMY_ROOM)).toBe(DUMMY_USER)
	})
	it('Should generate a warning to select a room first', () => {
		expect(typeof suite.Component.instance().generateMessages())
			.toBe(typeof {})
	})
	it('Should generate nothing if a room is specified and there are no messages to render', () => {
		const roomId = DUMMY_ROOM
		suite.Component.instance().changeSelectedRoom({roomId})
		expect(suite.Component.instance().generateMessages()).toBe(UNDEFINED)
	})
	it('Should generate a message if a room is specified and there are messages to render', () => {
		const roomId = DUMMY_ROOM
		suite.Component.instance().changeSelectedRoom({roomId})
		const msg = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: new Date().getTime()}
		suite.Component.instance().updateMessageState({roomId, ...msg})
		expect(suite.Component.instance().generateMessages().length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
	it('Should throw an error if the input is empty', () => {
		const roomId = DUMMY_ROOM
		suite.Component.instance().changeSelectedRoom({roomId})
		expect(() => suite.Component.instance().sendMessage()).toThrow()
	})
	it('Should throw an error if there is no room selected', () => {
		suite.Component.instance().handleUserInput({ target: { value: DUMMY_INPUT}})
		expect(() => suite.Component.instance().sendMessage()).toThrow()
	})
	it('Should throw an error if there is no room and there is no input', () => {
		expect(() => suite.Component.instance().sendMessage()).toThrow()
	})
	it('Should add a new message to the state', () => {
		const roomId = DUMMY_ROOM
		suite.Component.instance().changeSelectedRoom({roomId})
		suite.Component.instance().handleUserInput({ target: { value: DUMMY_INPUT}})
		suite.Component.instance().sendMessage()
		expect(suite.Component.state(MESSAGES).length).toBe(EXPECTED_ELEMENTS_COUNT)
	})
})