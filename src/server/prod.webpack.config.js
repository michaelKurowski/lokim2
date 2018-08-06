const path = require('path')
require('webpack')
module.exports = {
	mode: 'production',
	entry: {
		js: ['babel-polyfill', './frontEnd/src/index.js']
	},
	resolve: {
		alias: {
			'theme': path.resolve(__dirname, 'frontEnd/src/theme'),
			'services': path.resolve(__dirname, 'frontEnd/src/services'),
			'routing-config': path.resolve(__dirname, 'frontEnd/src/routes/routes.json')
		}
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
			},
			{
				test: /\.json$/,
				loader: 'json-loader'
			}
		]
	},
	target: 'web'
}