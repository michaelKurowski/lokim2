const React = require('react')
const ChatPage = require('theme/scenes/chatpage/chatpage')
const sinon = require('sinon')
const {configure, mount} = require('enzyme')
const {Provider} = require('react-redux')
const {MemoryRouter, Route} = require('react-router-dom')
const Adapter = require('enzyme-adapter-react-16')
const HOME_URL = require('routing-config').paths.HOME
const CHAT_URL = require('routing-config').paths.CHAT
const initializeRedux = require('frontEnd/src/initializeRedux')
const DUMMY_USERNAME = 'dummyUsername'
const webSocketProvider = require('services/webSocket/webSocketProvider')
const WEB_SOCKET_PROTOCOL = require('../../../../../protocol/protocol.json')
const findUsersActions = require('services/findUsers/findUsers.actions').actions
const roomActions = require('services/roomsManagement/room.actions').actions
const sessionActions = require('services/session/session.actions').actions
const webSocketActions = require('services/webSocket/webSocket.actions').actions
let suite = {}

const MOUSE_CLICK_EVENT = 'click'
const FORM_SUBMIT_EVENT = 'submit'

const ALREADY_JOINED_ROOM = 'lala'

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

		it('redirects to chatpage when user is logged in', () => {
			const EXPECTED_ELEMENTS_COUNT = 1
			suite.store.dispatch(sessionActions.authorise(DUMMY_USERNAME))
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
			suite.store.dispatch(sessionActions.authorise(DUMMY_USERNAME))
			suite.store.dispatch(webSocketActions.webSocketConnectionEstabilished('room'))
			suite.store.dispatch(webSocketActions.webSocketConnectionEstabilished('users'))
			suite.store.dispatch(roomActions.addMember(DUMMY_USERNAME, ALREADY_JOINED_ROOM))
			suite.renderedTree = mount(suite.wrapper)
		})
		describe('Sending message', () => {
			describe('when already in room', () => {
				beforeEach(() => {
					const roomDialer = suite.renderedTree.find('[data-test="list-dialer-element"]').first()
					roomDialer.simulate(MOUSE_CLICK_EVENT)
				})

					
				it('doesn\'t sends websocket event when message input is empty', () => {
					//given
					const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().room, 'emit')

					const messageSendButton = suite.renderedTree.find('[data-test="send-message"]').first()
	
					//when
					messageSendButton.simulate(FORM_SUBMIT_EVENT)
	
					//then
					const messageHasBeenSent = webSocketEmitSpy.calledWithMatch('message')
					expect(messageHasBeenSent).toBe(false)
				})

				it('sends proper websocket event when sending message', () => {
					//given
					const DUMMY_MESSAGE_TEXT = 'DOMMY_MESSAGE'
					const WEBSOCKET_MESSAGE_MOCK = {
						roomId: ALREADY_JOINED_ROOM,
						message: DUMMY_MESSAGE_TEXT,
						username: 'dummyUsername' 
					}
					const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().room, 'emit')
					
					const messageSendInput = suite.renderedTree.find('[data-test="message-input"]').first()
					const messageSendButton = suite.renderedTree.find('[data-test="send-message"]').first()
	
					//when
					
					messageSendInput.simulate('change', {target: {value: DUMMY_MESSAGE_TEXT}})
					messageSendButton.simulate(FORM_SUBMIT_EVENT)
	
					//then
					const messageHasBeenSent = webSocketEmitSpy.calledWithMatch('message', WEBSOCKET_MESSAGE_MOCK)
					expect(messageHasBeenSent).toBe(true)
	
				})
			})

			describe('when not in any room', () => {
				it('can\'t be done because of no send message button', () => {
					//given
					const messageSendButton = suite.renderedTree.find('[data-test="send-message"]').first()
	
					//when
					const messageSendButtonAmount = messageSendButton.length
	
					//then
					expect(messageSendButtonAmount).toBe(0)
				})
			})

		})

		describe('Receiving message', () => {
			it('updates messages history when received message belongs to currently selected room', () => {
				//given
				const DUMMY_MESSAGE = {
					action: 'message',
					date: 2121332142422,
					payload: {
						author: 'author',
						text: 'DUMMY_MESSAGE',
						roomId: ALREADY_JOINED_ROOM
					}
				}

				//when
				const roomDialer = suite.renderedTree.find('[data-test="list-dialer-element"]').first()
				roomDialer.simulate(MOUSE_CLICK_EVENT)
				suite.store.dispatch(roomActions.addMessage(DUMMY_MESSAGE, ALREADY_JOINED_ROOM))
				suite.renderedTree = mount(suite.wrapper)
				const messagesHistory = suite.renderedTree.find('[data-test="chat-message"]').first()

				//then
				expect(messagesHistory.props().text).toBe(DUMMY_MESSAGE.payload.text) 
			})

			it('doesn\'t update messages history when received message is from nonselected room', () => {
				//given
				const DUMMY_ROOM = 'lala2'
				const DUMMY_MESSAGE = {
					action: 'message',
					date: 2121332142422,
					payload: {
						author: 'author',
						text: 'DUMMY_MESSAGE',
						roomId: DUMMY_ROOM
					}
				}

				//when
				const roomDialer = suite.renderedTree.find('[data-test="list-dialer-element"]').first()
				roomDialer.simulate(MOUSE_CLICK_EVENT)
				suite.store.dispatch(roomActions.addMessage(DUMMY_MESSAGE, DUMMY_ROOM))
				suite.renderedTree = mount(suite.wrapper)
				const messagesHistory = suite.renderedTree.find('[data-test="chat-message"]').first()
				const messagesCount = messagesHistory.length

				//then
				expect(messagesCount).toBe(0) 
			})
		})

		describe('Searching for users', () => {
			it('sends relevelant websocket event when typing username', () => {
				//given
				const USERNAME_TO_FIND = 'DUMMY_USERNAME'
				const DUMMY_USER_QUERY = {
					queryPhrase: USERNAME_TO_FIND
				}
				const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().users, 'emit')
				const userQueryInput = suite.renderedTree.find('[data-test="user-query-input"]').first()

				//when
				userQueryInput.simulate('change', {target: {value: USERNAME_TO_FIND}})

				//then
				const hasWebscoketEventBeenSent = webSocketEmitSpy.calledWithMatch('find', DUMMY_USER_QUERY)
				expect(hasWebscoketEventBeenSent).toBe(true)
			})

			it('shows found usernames when receiving relevelant websocket message', () => {
				//given
				const RECEIVED_USERS = [
					'DUMMY_USER1',
					'DUMMY_USER2'
				]

				const userQueryInput = suite.renderedTree.find('[data-test="user-query-input"]').first()
				userQueryInput.simulate('change', {target: {value: RECEIVED_USERS[0]}})

				//when
				
				suite.store.dispatch(findUsersActions.usersFound(RECEIVED_USERS))
				suite.renderedTree.update()


				//then
				const listOfUsernames = suite.renderedTree.find('[data-test="users-finder-results"]').first()
				const displayedUsernamesFound = listOfUsernames.find('li').map(node => node.text())
				
				expect(displayedUsernamesFound).toMatchObject(RECEIVED_USERS)
			})

			it('sends websocket request to create new room when clicking on found user', () => {
				//given
				const RECEIVED_USERS = [
					'DUMMY_USER1'
				]
				const userQueryInput = suite.renderedTree.find('[data-test="user-query-input"]').first()
				userQueryInput.simulate('change', {target: {value: RECEIVED_USERS[0]}})
				const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().room, 'emit')
				suite.store.dispatch(findUsersActions.usersFound(RECEIVED_USERS))
				suite.renderedTree.update()
				const listOfUsernames = suite.renderedTree.find('[data-test="users-finder-results"]').first()
				const foundUser = listOfUsernames.find('li').first()

				//when
				foundUser.simulate(MOUSE_CLICK_EVENT)

				//then
				const EXPECTED_WEBSOCKET_PAYLOAD = {invitedUsersIndexes: RECEIVED_USERS}
				const hasWebSocketEventBeenSent =
					webSocketEmitSpy.calledWithMatch(WEB_SOCKET_PROTOCOL.room.eventTypes.CREATE, EXPECTED_WEBSOCKET_PAYLOAD)
				expect(hasWebSocketEventBeenSent).toBe(true)
			})
		})

		describe('Joining room', () => {
			it('sends proper websocket event when joining to room', () => {
				//given
				const ROOM_TO_JOIN = 'RoomToJoin'
				const webSocketEmitSpy = suite.sinonSandbox.spy(webSocketProvider.get().room, 'emit')

				//when
				const joinRoomInput = suite.renderedTree.find('[data-test="room-joiner-input"]').first()
				joinRoomInput.simulate('change', {target: {value: ROOM_TO_JOIN}})

				const joinRoomButton = suite.renderedTree.find('[data-test="room-joiner-button"]').first()
				joinRoomButton.simulate(MOUSE_CLICK_EVENT)

				//then
				const EXPECTED_WEBSOCKET_PAYLOAD = {
					roomId: ROOM_TO_JOIN
				}
				
				const hasWebSocketEventBeenSent =
					webSocketEmitSpy.calledWithMatch(WEB_SOCKET_PROTOCOL.room.eventTypes.JOIN, EXPECTED_WEBSOCKET_PAYLOAD)
				expect(hasWebSocketEventBeenSent).toBe(true)
			})
			it('adds room to rooms list', () => {
				//given
				const DUMMY_ROOM_ID = 'dummyRoom'
				suite.store.dispatch(roomActions.addMember(DUMMY_USERNAME, DUMMY_ROOM_ID))

				suite.renderedTree = mount(suite.wrapper)

				//then
				const roomDialer = suite.renderedTree.find('[data-test="list-dialer-element"]')
				const matchingElementsCount = roomDialer.find('li').findWhere(el => {
					try {
						// enzyme sometimes blows up on text()
						return el.text().includes(DUMMY_ROOM_ID)
					} catch (_e) {
						return ''
					}
				}).length

				expect(matchingElementsCount).toBe(2)
			})
		})
	})
})