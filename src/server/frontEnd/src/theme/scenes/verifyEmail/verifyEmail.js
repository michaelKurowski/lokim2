const React = require('react')

class VerifyEmail extends React.Component {
	constructor(props) {
		super(props)
	}

	isSuccessful() {
		return new URLSearchParams(location.search).get('is-validation-successful') === 'true'
	}

	render() {
		return (
			<div className='container-fluid register-div' id={this.isSuccessful() ? 'email-correct' : 'email-incorrect'}>
				{this.isSuccessful() ? <h2> Your email is correct</h2> : <h2> Your email is invalid</h2>}
			</div>
		)
	}
}

module.exports = VerifyEmail