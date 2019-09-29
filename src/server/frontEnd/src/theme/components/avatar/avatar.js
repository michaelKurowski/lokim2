const React = require('react')

class Avatar extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            username: this.props.username,
            size: this.props.size
        }
    }

    render(){
        return(
            <div className={`w-${this.state.size} `+ `h-${this.state.size}`}>
                <img src={`http://robohash.org/${this.state.username}`}/>
            </div>
        )
    }
}

module.exports = Avatar