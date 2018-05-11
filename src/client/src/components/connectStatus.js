const React = require('react')
const PropTypes = require('prop-types')

function ConnectStatus(props) {
	const {connection} = props
	return connection ? <h4 className='success'>Connected</h4> 
		: <h4 className='disconnect'>Disconnected / Error </h4> 
}

ConnectStatus.propTypes = {
	connection: PropTypes.bool
}
module.exports = ConnectStatus