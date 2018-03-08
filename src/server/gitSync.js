const spawn = require('child_process').spawn
const path = require('path')
const http = require('http')
const config = reqquire('./config.json')
//const logger = require('./logger')

const currentPath = path.resolve(__dirname)

http.createServer(handleHttpRequest).listen(config.gitIntegration.listeningPort)

function handleHttpRequest(req, res) {
    //Check if it's pull event from git
}

const gitPull = spawn(
    'git', ['pull', '--force', 'origin', config.gitIntegration.branch],
    {cwd: currentPath}
)

gitPull.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});


gitPull.stderr.on('data', data => consqole.log('stderr', data))

gitPull.on('error', errorMessage => {
    console.log('An error occured', errorMessage.Error)
})

gitPull.on('close', code => {
    if (code !== 0) console.log('git.on ', code) //TODO: error
})

