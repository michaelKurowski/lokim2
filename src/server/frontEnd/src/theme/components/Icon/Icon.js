
const React = require('react')

class Icon extends React.Component {


	handleSize(size) {
		if (size === "small") {
			return "50px"
		} else if (size === "big") {
			return "70px"
		} else "60px"
	}

	render() {
		const urlToIcon = `icons/${this.props.name}.svg`

		return (
			<img src={urlToIcon} height={this.handleSize(this.props.size)} />
		)
	}
}

module.exports = Icon