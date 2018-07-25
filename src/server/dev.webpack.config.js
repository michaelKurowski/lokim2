const path = require('path')
require('webpack')
module.exports = {
	mode: 'development',
	entry: {
		js: ['babel-polyfill', './frontEnd/src/index.js']
	},
	output: {
		path: path.resolve(__dirname, 'public'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'react']
				}
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/i,
				loader: 'url-loader',
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ]
			}
		]
	},
	resolve: {},
	devtool: 'source-map',
	target: 'web'
}