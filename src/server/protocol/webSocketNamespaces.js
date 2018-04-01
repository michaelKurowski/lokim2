module.exports = [
	{
		name: 'room',
		eventTypes: new Set(['message', 'join', 'leave', 'create', 'list', 'connection']),
		eventServerTypes: new Set(['debug', 'receiveMesage', 'joined', 'left', 'connected'])
	}
]

