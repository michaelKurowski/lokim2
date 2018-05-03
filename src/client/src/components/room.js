const React = require('react')

class Room extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            ID: this.props.ID,
            name: this.props.name
        }
    }
    render(){
        return(
            <div className='roomID' key={this.state.ID} onClick={this.props.onClick}>
                <li className=''>{this.state.name}</li>
            </div>
        )
    }
}

module.exports = Room