const spawn = require('child_process').spawn
const lokIMInitialization = require('./init')()
lokIMInitialization.then(() => spawn('npx', ['cypress', 'run'], {cwd: __dirname}))