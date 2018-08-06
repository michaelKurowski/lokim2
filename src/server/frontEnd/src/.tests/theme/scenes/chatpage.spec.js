const React = require('react')
const ChatPage = require('theme/scenes/chatpage/chatpage')
const sinon = require('sinon')
const {configure, mount, } = require('enzyme')
const {Provider} = require('react-redux')
const {MemoryRouter, Route} = require('react-router-dom')
const Adapter = require('enzyme-adapter-react-16')
const HOME_URL = require('routing-config').paths.HOME
const CHAT_URL = require('routing-config').paths.CHAT
const initializeRedux = require('../../../initializeRedux')
const DUMMY_USERNAME = 'dummyUsername'
const webSocketProvider = require('../../../services/webSocket/webSocketProvider')
const MessageInput = require('../../../theme/scenes/chatpage/components/chatWindow/messageInput/messageInput')
let suite = {}


configure({adapter: new Adapter()})
describe('<ChatPage />', () => {
	beforeEach(() => {
		suite = {}
		const store = initializeRedux()
		const HomeMock = () => (<div className='dummy'></div>)
		webSocketProvider.create()
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
			HomeMock: HomeMock,
			sinonSandbox: sinon.createSandbox()
		}
	})

	afterEach(() => {
		suite.sinonSandbox.restore()
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

	describe('In it\'s initial state', () => {
		it('have no room selected', () => {
			mount(suite.wrapper)
			expect(suite.store.getState().roomsManagementReducer.selectedRoom).toBe('')
		})

		it('have no rooms loaded', () => {
			mount(suite.wrapper)
			const roomIds = Object.keys(suite.store.getState().roomsManagementReducer.rooms)
			const amountOfRooms = roomIds.length
			expect(amountOfRooms).toBe(0)
		})

		it('have username displayed', () => {
			mount(suite.wrapper)
			const userUsername = suite.store.getState().sessionReducer.username
			expect(userUsername).toBe('')
		})
	})

	describe('Functionality', () => {
		beforeEach(() => {
			suite.store.dispatch({type: 'AUTHORISE', payload: {username: DUMMY_USERNAME}})
			suite.store.dispatch({type: 'WEBSOCKET_CONNECTION_ESTABILISHED', payload: {namespace: 'room'}})
			suite.store.dispatch({type: 'WEBSOCKET_CONNECTION_ESTABILISHED', payload: {namespace: 'users'}})
			suite.store.dispatch({type: 'ADD_MEMBER', payload: {username: DUMMY_USERNAME, roomId: 'lala'}})
		})
		describe('Messaging', () => {
			describe('when already in room', () => {
				beforeEach(() => {
					suite.renderedTree = mount(suite.wrapper)
					const roomDialer = suite.renderedTree.find('[data-test="list-dialer-element"]').first()
					roomDialer.simulate('click')
				})

				it('sends proper ws event when sending message', () => {
					//given
					const WEBSOCKET_MESSAGE_MOCK = {
						roomId: 'lala',
						message: 'DOMMY_MESSAGE',
						username: 'dummyUsername' 
					}
					const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().room, 'emit')
					
					const messageSendInput = suite.renderedTree.find('[data-test="message-input"]').first()
					const messageSendButton = suite.renderedTree.find('[data-test="send-message"]').first()
	
					//when
					
					messageSendInput.simulate('change', {target: {value: 'DOMMY_MESSAGE'}})
					messageSendButton.simulate('submit')
	
					//then
					const messageHasBeenSent = webSocketEmitSpy.calledWithMatch('message', WEBSOCKET_MESSAGE_MOCK)
					expect(messageHasBeenSent).toBe(true)
	
				})
	
				it('doesn\'t sends websocket event if message input is empty', () => {
					//given
					const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().room, 'emit')

					const messageSendButton = suite.renderedTree.find('[data-test="send-message"]').first()
	
					//when
					
					messageSendButton.simulate('submit')
	
					//then
					const messageHasBeenSent = webSocketEmitSpy.calledWithMatch('message')
					expect(messageHasBeenSent).toBe(false)
				})
	
				it('adds message to chat history when messages data of selected room changes in store', () => {
					//given
					const DUMMY_MESSAGE = {
						message: 'DUMMY_MESSAGE',
						timestamp: 121243454623453462346,
						username: 'author',
						roomId: 'lala'
					}

					//when
					suite.store.dispatch({type: 'ADD_MESSAGE', payload: {message: DUMMY_MESSAGE, roomId: 'lala'}})
					suite.renderedTree = mount(suite.wrapper)
					const messagesHistory = suite.renderedTree.find('[data-test="chat-message"]').first()

					//then
					expect(messagesHistory.props().text).toBe('DUMMY_MESSAGE') 
				})
			})

		})

		describe('Inviting users', () => {
			it('sends relevelant websocket event when typing username', () => {

			})

			it('shows found usernames when receiving relevelant websocket message', () => {

			})

			it('switches to new room when user is invited by somebody', () => {

			})
		})

		describe('Joining rooms', () => {
			it('sends proper action when joining to room', () => {

			})

			it('adds room to avsilible rooms when list of rooms changes in store', () => {

			})

			it('changes messages history when selecting another room', () => {

			})

			it('changes room members when selecting another room', () => {
				
			})
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