const React = require('react')
const fetch = require('node-fetch')
const {BrowserRouter, Link, Redirect} = require('react-router-dom')
const responseCodes = require('../statusCodeResponses')

const SUCCESS_CODE = 200
const REGISTER_URL = '/register', HOMEPAGE_PATH = '/', POST = 'POST', headers = { 'Content-Type': 'application/json' }

class Register extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            username: '',
            password: '',
            email: '',
            successfulRegister: false
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }
    handleChange(event){
        this.setState({ [event.target.name] : event.target.value})
    }
    
    handleSubmit(event){
        fetch(REGISTER_URL, {
            method: POST, headers,
            body: JSON.stringify(this.state)
        })
        .then(response => {
            if(response.status === SUCCESS_CODE){
                this.setState({successfulRegister: true})
            }
            if(responseCodes.hasOwnProperty(response.status)){
                alert(responseCodes[response.status])
                console.log(response.status, response)
            }
        })
        .catch(error => console.err(error))
        event.preventDefault()
    }
    render(){
        if(this.state.successfulRegister){
            return <Redirect to='/'/>
        }
        return (
            <div className='container-fluid register-div'>
                <h2> Register for a new LokIM Account </h2>
                <form onSubmit={this.handleSubmit}>
                    <input type='text' className='user-input' placeholder='Username' value={this.state.username} onChange={this.handleChange} name='username' required/><br/>
                    <input type='password' className='user-input' placeholder='Password' value={this.state.password} onChange={this.handleChange} name='password' required/><br/>
                    <input type='text' className='user-input' placeholder='Email' value={this.state.email} onChange={this.handleChange} name='email' required/><br/>
                    <input type='submit' className='btn btn-primary register-button' value='Register'/>
                    <Link className='btn btn-secondary' to={HOMEPAGE_PATH}>Go Back</Link>
                </form>   
            </div>
        )
    }
}

module.exports = Register