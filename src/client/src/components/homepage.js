const React = require('react')
const {Link, Redirect} = require('react-router-dom')
const fetch = require('node-fetch')
const logo = require('../logo.svg')
const responseCodes = require('../statusCodeResponses')
const LOGIN_URL = '/login'

class HomePage extends React.Component {
    constructor(props){
        super(props)

        this.state = {
            username: '',
            password: '',
            successfulLogin: false
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    loginHandler(username, password){
        fetch(LOGIN_URL, {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if(response.status === 200){
                this.setState({successfulLogin: true})
            }
            if(responseCodes.hasOwnProperty(response.status)){
                alert(responseCodes[response.status])
                console.log(response.status, response)
            }
        }).catch(err => console.err(err))
    }

    handleChange(event){
        const settings = {'Username': 'username', 'Password': 'password'}
        const key = settings[event.target.placeholder]
        this.setState({ [key] : event.target.value})
    }
    handleSubmit(event){
        this.loginHandler(this.state.username, this.state.password)
        event.preventDefault()
    }
    render(){
        if(this.state.successfulLogin){
            return <Redirect to={{
                pathname: '/chat',
                state: {username: this.state.username}
            }}/>
        }
        return (
            <div className="App">
            <div className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h2>Welcome to Loki Instant Messenger</h2>
                <p className="App-intro">Hello LokIM User!</p>
            </div>
            <form onSubmit={this.handleSubmit}>
            <input className='userInput' type="text" value={this.state.username} onChange={this.handleChange} placeholder="Username" required/><br/>
            <input className='userInput' type="password" value={this.state.password} onChange={this.handleChange} placeholder="Password" required/><br/>
            <input type='submit' className='homeButton btn btn-primary' value='Login'/>
            </form>
            <li className="homeButton btn btn-secondary"><Link to='/register'>Create Account</Link></li>
            <p className='info-paragraph'>LokIM connects to other users via websockets through a server and very little information is stored on the server post-emission. All data regarding a user is stored on said user's device. The only information we store on the server is that which is required for essential functionality.</p>
            </div>
        )
    }
    
}

module.exports = HomePage