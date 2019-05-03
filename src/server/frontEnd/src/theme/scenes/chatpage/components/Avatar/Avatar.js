const React = require('react')


class Avatar extends React.Component {
    constructor() {
        super()
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
            <img src={`http://robohash.org/${this.props.username}`} height={this.handleSize(this.props.size)} />
        )
    }
}

module.exports = Avatar