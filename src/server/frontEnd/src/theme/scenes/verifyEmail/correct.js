const React = require('react')

class Register extends React.Component {
	constructor(props) {
		super(props)
	}
	render() {
		return (
			<div className='container-fluid register-div' id='email-correct'>
				<h2> Your email is correct</h2>
			</div>
		)
	}
}

module.exports = Register