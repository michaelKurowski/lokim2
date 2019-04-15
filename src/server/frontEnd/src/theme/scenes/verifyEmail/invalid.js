const React = require('react')
const {Link, Redirect} = require('react-router-dom')
const _fetch = require('node-fetch')
const {urls, paths} = require('routing-config')
const SUCCESS_CODE = 200
const USER_ALREADY_EXIST = 400
const REGISTER_URL = urls.REGISTER
const HOMEPAGE_PATH = paths.HOME
const POST = 'POST'
const headers = { 'Content-Type': 'application/json' }

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