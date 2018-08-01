const React = require('react')
const ChatPage = require('theme/scenes/chatpage/chatpage')
const ConnectStatus = require('theme/scenes/chatpage/components/connectStatus/connectStatus')
const HomePage = require('theme/scenes/homepage/homepage')
const {configure, mount, shallow, render } = require('enzyme')
const createRouterContext = require('react-router-test-context').default
const {BrowserRouter, MemoryRouter, Switch, Route, Redirect} = require('react-router-dom')
const {Provider} = require('react-redux')
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
const HOME_URL = require('routing-config').paths.HOME
const CHAT_URL = require('routing-config').paths.CHAT
const EXPECTED_ELEMENTS_COUNT = 1
const FIRST_INDEX = 0
const NO_ROOM_SELECTED = ''
const NO_INPUT = ''
const initializeRedux = require('../../../initializeRedux')
const DUMMY_USERNAME = 'dummyUsername'
let suite = {}


configure({adapter: new Adapter()})
describe('<ChatPage />', () => {
	beforeEach(() => {
		suite = {}
		const store = initializeRedux()
		const HomeMock = () => (<div className='dummy'></div>)

		const CHATPAGE_COMPONENT = 
			<Provider store={store}>
				<MemoryRouter initialEntries={[CHAT_URL]}>
					<div>
						<Route path={HOME_URL} component={HomeMock} />
						<Route path={CHAT_URL} component={ChatPage} />
					</div>
				</MemoryRouter>
			</Provider>

		suite = {
			wrapper: CHATPAGE_COMPONENT,
			store: store,
			HomeMock: HomeMock
		}
	})
	describe('Healthcheck', () => {
		it('redirects to homepage when user is not logged in', () => {
			const EXPECTED_ELEMENTS_COUNT = 1
			const renderedTree = mount(suite.wrapper)
			const elementsCount = renderedTree.find(suite.HomeMock).length
			expect(elementsCount).toBe(EXPECTED_ELEMENTS_COUNT)
		})

		it('redirects to homepage when user is logged in', () => {
			const EXPECTED_ELEMENTS_COUNT = 1
			suite.store.dispatch({type: 'AUTHORISE', payload: {username: DUMMY_USERNAME}})
			const renderedTree = mount(suite.wrapper)
			const elementsCount = renderedTree.find(ChatPage).length
			expect(elementsCount).toBe(EXPECTED_ELEMENTS_COUNT)
		})
	})

	describe('In it\'s initial state' , () => {
		it('have no room selected', () => {

		})

		it('have no messages loaded', () => {

		})

		it('have username displayed', () => {

		})
	})

	describe('Functionality', () => {
		describe('Messaging', () => {
			it('sends ', () => {

			})
		})

		describe('Inviting users', () => {

		})

		describe('Joining rooms', () => {

		})
	})
/*
	describe('<ChatPage /> Render Tests', () => {
		it('Should render HomePage when no username is provided', () => {
			const context = <div></div>
			const wrapper = mount(
				<BrowserRouter exact path="/">
					<Switch>
						<Route path='/' component={HomePage} />
						<Route path='/chat' component={ChatPage} /> 
					</Switch>
				</BrowserRouter>)
			
			const EXPECTED_DATA = wrapper.instance().history.pathname
			expect(EXPECTED_DATA).toBe(HOME_PATH)
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
			const EXPECTED_DATA = {roomId, username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: DUMMY_TIMESTAMP}
			suite.Component.instance().updateMessageState(EXPECTED_DATA)
			expect(suite.Component.state(MESSAGES).length).toBe(EXPECTED_MESSAGE_COUNT)
		})
		it('Should update messages to state if the selectedroom is the same as the roomId of the message', () => {
			const roomId = DUMMY_ROOM
			const fakeData = {roomId, username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: DUMMY_TIMESTAMP}
			suite.Component.instance().changeSelectedRoom({roomId})
			suite.Component.instance().updateMessageState(fakeData)
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
			const msg = {roomId, username: DUMMY_USER, message: DUMMY_MESSAGE, timestamp: new Date().getTime()}
			suite.Component.instance().updateMessageState(msg)
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
	})*/
})