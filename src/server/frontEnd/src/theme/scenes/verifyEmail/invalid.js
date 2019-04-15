const React = require('react')

class Register extends React.Component {
	constructor(props) {
		super(props)
	}
	render() {
		return (
			<div className='container-fluid register-div' id='email-incorrect'>
				<h2> Your email is invalid</h2>
			</div>
		)
	}
}

module.exports = Register