const React = require('react')


function ConnectStatus(props){
    const {connection} = props
    return connection ? <h4 style={{color: 'blue'}}>Connected</h4> 
        : <h4 style={{color: 'red'}}>Disconnected / Error </h4> 
}

module.exports = ConnectStatus