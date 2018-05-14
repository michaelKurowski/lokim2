const wst = (socketIo => {// eslint-disable-line no-unused-vars
	const USERNAME_INPUT_ID = 'username'
	const PASSWORD_INPUT_ID = 'password'
	const EVENT_TYPE_SELECT_ID = 'event-name-to-send'
	const EVENTS_TO_LISTEN_TABLE_ID = 'events-to-listen'
	const INCOMMING_TRAFFIC_TABLE_ID = 'ws-table'
	const EVENT_TO_SEND_DATA_INPUT_ID = `event-value`
	const LOG_IN_ENDPOINT = '/login'
	const NAMESPACE_SELECT_ID = 'address'
	const WEBSOCKET_CONNECTION_PATH = '/connection'
	let protocol
	let websocketConnection

	async function authorize() {
		const password = getPassword()
		const username = getUsername()
		const requestConfig = {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({username, password}),
			credentials: 'same-origin'
		}
		const request = new Request(LOG_IN_ENDPOINT, requestConfig)

		const authorizationResult = await fetch(request).then(response => response.text())
		alert(`Authorization answer: ${authorizationResult}`)
		protocol = await loadProtocol()
		const namespaces = Array.from(protocol.keys())
		setNamespaces(namespaces)
		resetListenersTable()
		resetIncommingEventsTable()
	}

	async function connect() {
		resetListenersTable()
		resetIncommingEventsTable()
		const namespace = getNamespace()
		const eventTypes = protocol.get(namespace)
		setEventTypes(eventTypes)
		const address = `${location.host}/${namespace}`
		websocketConnection = socketIo(address, {path: WEBSOCKET_CONNECTION_PATH})
		websocketConnection.on('connect', setupListeners)
	}

	function sendEvent() {
		const eventType = getEventTypeToSend()
		const eventData = getEventTypeToSendData()
		const eventValueObject = eventData ? JSON.parse(eventData) : null
		websocketConnection.emit(eventType, eventValueObject)
		pushOutcommingEvent(eventType, eventValueObject)
	}

	function setEventTypes(eventTypes) {
		getEventTypeToSendSelect().innerHTML = ''
		eventTypes.forEach(pushEventType)
	}

	function setNamespaces(namespaces) {
		getNamespaceSelect().innerHTML = ''
		namespaces.forEach(pushNamespace)
	}

	function setupListeners() {
		const namespace = getNamespace()
		const eventTypes = protocol.get(namespace)
		eventTypes.forEach(listenForEvent)
		eventTypes.forEach(pushEventOptionToSend)
	}

	function listenForEvent(eventName) {
		const eventsTable = getEventListenersTable()
		eventsTable.innerHTML += `<tr><td>${eventName}</td></tr>`

		websocketConnection.on(eventName, packet => {
			const stringifiedPacket = JSON.stringify(packet)
			pushIncommingEvent(eventName, stringifiedPacket)
		})
	}

	function loadProtocol() {
		return fetch(new Request('../protocol/protocol.json'))
			.then(response => response.text())
			.then(text => {
				const namespacesToEventsMap = new Map()
				const protocol = JSON.parse(text)
				const namespaces = Object.keys(protocol)
				namespaces.forEach(namespace => {
					const eventTypes = Object.values(protocol[namespace].eventTypes)
					namespacesToEventsMap.set(namespace, eventTypes)
				})
				return namespacesToEventsMap
			})
			.catch(err => alert(new Error(err)))
	}

	//DOM INTERACTIONS

	function getUsername() {
		return document.getElementById(USERNAME_INPUT_ID).value
	}

	function getPassword() {
		return document.getElementById(PASSWORD_INPUT_ID).value
	}

	function pushNamespace(namespaceName) {
		getNamespaceSelect().innerHTML += 
			`<option value='${namespaceName}'>${namespaceName}</option>`
	}

	function pushEventOptionToSend(eventName) {
		const select = document.getElementById('event-name-to-send')
		select.innerHTML +=
			`<option value='${eventName}'>${eventName}</option>`
	}

	function pushEventType(eventType) {
		getEventTypeToSendSelect().innerHTML += 
			`<option value='${eventType}'>${eventType}</option>`
	}

	function resetIncommingEventsTable() {
		getIncommingTrafficTable().innerHTML = ''
	}

	function resetListenersTable() {
		getEventListenersTable().innerHTML = ''
	}

	function pushIncommingEvent(eventType, packet) {
		const incommingTrafficTable = getIncommingTrafficTable()
		incommingTrafficTable.innerHTML += 
			`<tr><td>Received</td><td>${eventType}</td><td>${JSON.stringify(packet)}</td></tr>`
	}

	function pushOutcommingEvent(eventType, packet) {
		const incommingTrafficTable = getIncommingTrafficTable()
		incommingTrafficTable.innerHTML += 
			`<tr><td>Sent</td><td>${eventType}</td><td>${JSON.stringify(packet)}</td></tr>`
	}

	function getEventTypeToSendData() {
		return document.getElementById(EVENT_TO_SEND_DATA_INPUT_ID).value
	}

	function getNamespace() {
		return getNamespaceSelect().value
	}

	function getNamespaceSelect() {
		return document.getElementById(NAMESPACE_SELECT_ID)
	}

	function getEventTypeToSend() {
		return getEventTypeToSendSelect().value
	}

	function getEventTypeToSendSelect() {
		return document.getElementById(EVENT_TYPE_SELECT_ID)
	}

	function getIncommingTrafficTable() {
		return document.getElementById(INCOMMING_TRAFFIC_TABLE_ID)
	}

	function getEventListenersTable() {
		return document.getElementById(EVENTS_TO_LISTEN_TABLE_ID)
	}

	return {
		authorize,
		sendEvent,
		connect
	}
})(io)// eslint-disable-line no-undef