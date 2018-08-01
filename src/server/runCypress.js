const spawn = require('child_process').spawn
const initLokIM = require('init')
initLokIM.then(() => spawn('npx cypress run'))