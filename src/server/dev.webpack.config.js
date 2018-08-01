const productionConfig = require('./prod.webpack.config')

const devModeOptions = {
	devtool: 'source-map',
	mode: 'development'
}

module.exports = Object.assign({}, productionConfig, devModeOptions)