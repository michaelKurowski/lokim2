const React = require('react')
const fetch = require('node-fetch')
const {Link, Redirect} = require('react-router-dom')

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
        const settings = {'Username': 'username' , 'Password' : 'password', 'Email': 'email'}
        const key = settings[event.target.placeholder]
        this.setState({ [key] : event.target.value})
    }
    
    handleSubmit(event){
        fetch(REGISTER_URL, {
            method: 'POST',
            body: JSON.stringify(this.state),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            if(response.status === 200) this.setState({successfulRegister: true})
            console.log(`${response.status}: ${response.statusText}`)
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
                <input type='text' className='userInput' placeholder='Username' value={this.state.username} onChange={this.handleChange} required/><br/>
                <input type='password' className='userInput' placeholder='Password' value={this.state.password} onChange={this.handleChange} required/><br/>
                <input type='text' className='userInput' placeholder='Email' value={this.state.email} onChange={this.handleChange} required/><br/>
                <input type='submit' className='btn btn-primary' value='Register'/>
                <li className='btn btn-secondary' style={{'margin' : '10px 10px'}}><Link to='/'>Go Back</Link></li>
            </form>   
            </div>
        )
    }
}

module.exports = Register