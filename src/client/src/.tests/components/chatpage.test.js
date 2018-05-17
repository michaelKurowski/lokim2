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
const DUMMY_TIMESTAMP = 1526144128481
const MESSAGES = 'messages'
const SIDEBAR = '.sidebar'
const USERNAME = 'username'
const MESSAGE_AREA = '.message-area'
const SELECTED_ROOM = 'selectedRoom'
const MESSAGE_CLASS = '.message'
const DUMMY_INPUT = 'dummyInput'
const CONNECTED = 'connected'
const ERROR_MESSAGE = 'No room selected || input field is empty.'
const INPUT = 'input'
const HOME_PATH = require('../../routes/routes').paths.HOME
const EXPECTED_ELEMENTS_COUNT = 1
const FIRST_INDEX = 0
const NO_ROOM_SELECTED = ''
const NO_INPUT = ''

/* eslint-disable no-unused-vars */
const sessionStorage = require('mock-local-storage')
/* eslint-enable no-unused-vars */
let suite = {}

global.window = {}

configure({adapter: new Adapter()})
describe('<ChatPage />', () => {
	beforeEach(() => {
		const CHATPAGE_COMPONENT = <BrowserRouter><ChatPage location={{state: {username: DUMMY_USER}}}/></BrowserRouter>
		suite.wrapper = mount(CHATPAGE_COMPONENT)
		suite.Component = shallow(CHATPAGE_COMPONENT).find(ChatPage).dive()
		window.sessionStorage = global.sessionStorage
	})
	afterEach(() => {
		suite = {}
		window.sessionStorage.clear()

	})
	describe('<ChatPage /> Render Tests', () => {
		it('Should render HomePage with no username', () => {
			const wrapper = mount(<BrowserRouter><ChatPage location={{state: {}}}/></BrowserRouter>)
			const EXPECTED_DATA = wrapper.html()
			expect(EXPECTED_DATA).toBeFalsy()
		})
		it('Should render without crashing', () => {
			const ELEMENTS_COUNT = suite.wrapper.length
			expect(ELEMENTS_COUNT).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should have a ConnectStatus component', () => {
			const ELEMENTS_COUNT = suite.wrapper.find(ConnectStatus).length
			expect(ELEMENTS_COUNT).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should have a sidebar', () => {
			const ELEMENTS_COUNT = suite.wrapper.find(SIDEBAR).length
			expect(ELEMENTS_COUNT).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should have no rooms loaded', () => {
			const EXPECTED_ELEMENTS_COUNT = 0
			const ELEMENTS_COUNT = suite.wrapper.find(Room).length
			expect(ELEMENTS_COUNT).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should have a content section of class .message-area', () => {
			const ELEMENTS_COUNT = suite.wrapper.find(MESSAGE_AREA).length
			expect(ELEMENTS_COUNT).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should have no messages loaded', () => {
			const EXPECTED_ELEMENTS_COUNT = 0
			const ELEMENTS_COUNT = suite.wrapper.find(MESSAGE_CLASS).length
			expect(ELEMENTS_COUNT).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should have a logout button', () => {
			//Fixme
			expect(suite.wrapper.find('a').length).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Logout button URL should be / ', () => {
			//Fixme
			expect(suite.wrapper.find({href: HOME_PATH}).length).toBe(EXPECTED_ELEMENTS_COUNT)
		})
	})
	describe('<ChatPage /> Initial State Tests', () => {
		it('Should return the selected room', () => {
			suite.Component.instance().changeSelectedRoom({roomId: DUMMY_ROOM})
			const ROOM = suite.Component.state(SELECTED_ROOM)
			expect(ROOM).toBe(DUMMY_ROOM)
		})
		it('Should have no selected room on mount', () => {
			const ROOM = suite.Component.state(SELECTED_ROOM)
			expect(ROOM).toBe(NO_ROOM_SELECTED)
		})
		it('Should be disconnected at startup', () => {
			const EXPECTED_CONNECTION = suite.Component.state(CONNECTED)
			expect(EXPECTED_CONNECTION).toBeFalsy()
		})
		it('Should have no input at startup', () => {
			const INITIAL_INPUT = suite.Component.state(INPUT)
			expect(INITIAL_INPUT).toBe(NO_INPUT)
		})
		it('Should have no messages at startup', () => {
			const EXPECTED_MESSAGE_COUNT = 0
			const INITIAL_MESSAGES = suite.Component.state(MESSAGES).length
			expect(INITIAL_MESSAGES).toBe(EXPECTED_MESSAGE_COUNT)
		})
		it('Should have no userRooms at startup', () => {
			const EXPECTED_USERROOM_COUNT = 0
			const INITIAL_USERROOMS = suite.Component.state(USERROOMS).length
			expect(INITIAL_USERROOMS).toBe(EXPECTED_USERROOM_COUNT)
		})
		it('Should have a username at startup', () => {
			const USERNAME_ON_INIT = suite.Component.state(USERNAME)
			expect(USERNAME_ON_INIT).toBe(DUMMY_USER)
		})
	})
	describe('<ChatPage /> Functionality Tests', () => {
		it('Should update joined rooms', () => {
			const EXPECTED_DATA = {roomId: DUMMY_ROOM, username: DUMMY_USER}
			suite.Component.instance().updateJoinedRooms(EXPECTED_DATA)
			const USERROOM_ROOMID = suite.Component.state(USERROOMS)[FIRST_INDEX].roomId
			const USERROOM_USERNAMES = suite.Component.state(USERROOMS)[FIRST_INDEX].usernames
	
			expect(USERROOM_ROOMID).toBe(EXPECTED_DATA.roomId)
			expect(USERROOM_USERNAMES).toBe(EXPECTED_DATA.username)
		})
		it('Should store a message to sessionStorage', () => {
			const roomId = DUMMY_ROOM
			const EXPECTED_DATA = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: DUMMY_TIMESTAMP}
			suite.Component.instance().storeMessage(roomId, EXPECTED_DATA)
			const retrievedObject = JSON.parse(window.sessionStorage.getItem(roomId))
			expect(retrievedObject[FIRST_INDEX].message).toBe(EXPECTED_DATA.message)
			expect(retrievedObject[FIRST_INDEX].username).toBe(EXPECTED_DATA.username)
			expect(retrievedObject[FIRST_INDEX].timestamp).toBe(EXPECTED_DATA.timestamp)
		})
		it('Should not update messages to state if the selected room is not the same', () => {
			const roomId = DUMMY_ROOM
			const EXPECTED_MESSAGE_COUNT = 0
			const EXPECTED_DATA = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: DUMMY_TIMESTAMP}
			suite.Component.instance().updateMessageState({roomId, ...EXPECTED_DATA})
			expect(suite.Component.state(MESSAGES).length).toBe(EXPECTED_MESSAGE_COUNT)
		})
		it('Should update messages to state if the selectedroom is the same as the roomId of the message', () => {
			const roomId = DUMMY_ROOM
			const fakeData = {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: DUMMY_TIMESTAMP}
			suite.Component.instance().changeSelectedRoom({roomId})
			suite.Component.instance().updateMessageState({roomId, ...fakeData})
			expect(suite.Component.state(MESSAGES).length).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should return no users of room, when there are no users in room', () => {
			expect(suite.Component.instance().findUsersOfRoom(DUMMY_ROOM)).toBe(NO_ROOM_SELECTED)
		})
		it('Should return a user in the room, when user joined a room', () => {
			suite.Component.instance().updateJoinedRooms({username: DUMMY_USER, roomId: DUMMY_ROOM})
			expect(suite.Component.instance().findUsersOfRoom(DUMMY_ROOM)).toBe(DUMMY_USER)
		})
		it('Should generate a warning to select a room first', () => {
			//Fix me
			expect(typeof suite.Component.instance().generateMessages())
				.toBe(typeof {})
		})
		it('Should generate nothing if a room is specified and there are no messages to render', () => {
			const roomId = DUMMY_ROOM
			suite.Component.instance().changeSelectedRoom({roomId})
			expect(suite.Component.instance().generateMessages()).toBeUndefined()
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
			expect(() => suite.Component.instance().sendMessage()).toThrow(ERROR_MESSAGE)
		})
		it('Should throw an error if there is no room and there is no input', () => {
			expect(() => suite.Component.instance().sendMessage()).toThrow(ERROR_MESSAGE)
		})
		it('Should add a new message to the state when users sends a message', () => {
			const roomId = DUMMY_ROOM
			suite.Component.instance().changeSelectedRoom({roomId})
			suite.Component.instance().handleUserInput({ target: { value: DUMMY_INPUT}})
			suite.Component.instance().sendMessage()
			expect(suite.Component.state(MESSAGES).length).toBe(EXPECTED_ELEMENTS_COUNT)
		})
		it('Should handle the connection event by setting connection state to true', () => {
			const RETURN_VALUE = suite.Component.instance().handleConnectionEvent()
			const CONNECT_STATUS = suite.Component.state(CONNECTED)
			expect(CONNECT_STATUS).toBeTruthy()
			expect(RETURN_VALUE).toBeUndefined()
		})
		it('Should handle the message event', () => {
			const MESSAGE_DATA =  {username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: DUMMY_TIMESTAMP}
			const RETURN_VALUE = suite.Component.instance().handleMessageEvent(MESSAGE_DATA)
			expect(RETURN_VALUE).toBeUndefined()
		})
		it('Should handle the join event and update state', () => {
			const JOIN_DATA = {roomId: DUMMY_ROOM, username: DUMMY_USER}
			const RETURN_VALUE = suite.Component.instance().handleJoinEvent(JOIN_DATA)
			const USERROOM_ROOMID = suite.Component.state(USERROOMS)[FIRST_INDEX].roomId
			const USERROOM_USERNAMES = suite.Component.state(USERROOMS)[FIRST_INDEX].usernames
	
			expect(USERROOM_ROOMID).toBe(JOIN_DATA.roomId)
			expect(USERROOM_USERNAMES).toBe(JOIN_DATA.username)
			expect(RETURN_VALUE).toBeUndefined()
		})
	})
})