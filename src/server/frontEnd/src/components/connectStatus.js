const React = require('react')

function ConnectStatus(props) {
	const {connection} = props
	return connection ? <h4 className='success'>Connected</h4> 
		: <h4 className='disconnect'>Disconnected / Error </h4> 
}

module.exports = ConnectStatus