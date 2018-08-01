const spawn = require('child_process').spawn
const lokIMInitialization = require('./init')()
Promise.all([
	lokIMInitialization.dbConnection,
	lokIMInitialization.httpServerListening
]).then(() => spawn('npx', ['cypress', 'run'], {cwd: __dirname}))