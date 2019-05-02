class Icon extends React.Component {

	render() {
		const urlToIcon = `assets/${this.props.name}.svg`
		const small = "100px"
		const medium = "150px"
		const big = "200px"

		return (
			<img src={urlToIcon} height={big} />
		)
	}
}