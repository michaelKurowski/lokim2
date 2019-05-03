const React = require('react')


class Avatar extends React.Component {
    constructor(props) {
        super(props)
    }

    handleSize(size) {
        if (size === 'small') {
            return '50px'
        } else if (size === 'big') {
            return '70px'
        } else '60px'
    }

    render() {
        return (
            <img className='card-img-top' src={`http://robohash.org/${this.props.username}`} height={this.handleSize(this.props.size)} />
        )
    }
}

module.exports = Avatar