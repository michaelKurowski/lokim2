const path = require('path')
require('webpack')
module.exports = {
	mode: 'production',
	entry: {
		js: ['babel-polyfill', './frontEnd/src/index.js'],
		vendor: ['react']
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
				test: /.svg?$/,
				loader: 'svg-inline-loader'
			},
			{
				test: /\.css$/,
				use: [ 'style-loader', 'css-loader' ]
			}
		]
	},
	resolve: {},
	target: 'web'
}