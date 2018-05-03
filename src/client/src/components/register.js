const React = require('react')
const fetch = require('node-fetch')
const {Link, Redirect} = require('react-router-dom')
const responseCodes = require('../statusCodeResponses')

const REGISTER_URL = '/register'

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
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if(response.status === 200){
                this.setState({successfulRegister: true})
            }
            if(responseCodes.hasOwnProperty(response.status)){
                alert(responseCodes[response.status])
                console.log(response.status, response)
            }
        })
        .catch(error => {
            console.err(error)
        })
        event.preventDefault()
    }
    render(){
        if(this.state.successfulRegister){
            return <Redirect to='/'/>
        }
        return (
            <div className='container-fluid registerDiv'>
            <h2> Register for a new LokIM Account </h2>
            <form onSubmit={this.handleSubmit}>
                <input type='text' className='userInput' placeholder='Username' value={this.state.username} onChange={this.handleChange} name='username' required/><br/>
                <input type='password' className='userInput' placeholder='Password' value={this.state.password} onChange={this.handleChange} name='password' required/><br/>
                <input type='text' className='userInput' placeholder='Email' value={this.state.email} onChange={this.handleChange} name='email' required/><br/>
                <input type='submit' className='btn btn-primary' value='Register'/>
                <li className='btn btn-secondary' style={{'margin' : '10px 10px'}}><Link to='/'>Go Back</Link></li>
            </form>   
            </div>
        )
    }
}

module.exports = Register