const {series} = require('gulp')
const exec = require('child_process').exec
const path = require('path')

function start(cb) {
    const destinationPath = path.resolve(__dirname, 'src', 'server')
    const cliProcess = exec(`npm start --prefix ${destinationPath}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
    cliProcess.stdout.on('data', function(data) {
        console.log(data)
    })
}

function installServerDependencies(cb) {
    const destinationPath = path.resolve(__dirname, 'src', 'server')
    exec(`npm install --prefix ${destinationPath}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function installFrontEndDependencies(cb) {
    const destinationPath = path.resolve(__dirname, 'src', 'server', 'frontEnd')
    exec(`npm install --prefix ${destinationPath}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function buildDev(cb) {
    const destinationPath = path.resolve(__dirname, 'src', 'server')
    exec(`npm run build-dev --prefix ${destinationPath}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function build() {
    const destinationPath = path.resolve(__dirname, 'src', 'server')
    exec(`npm run build --prefix ${destinationPath}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function generateConfig(cb) {
    const destinationPath = path.resolve(__dirname, 'src', 'server')
    exec(`npm run generate-config --prefix ${destinationPath}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function preparationMessege(cb) {
    console.log('Now fill /src/server/config.json or set environmental variables')
    cb();
}


const prepareDev = series(installServerDependencies, installFrontEndDependencies, buildDev, generateConfig, preparationMessege)
const prepare = series(installServerDependencies, installFrontEndDependencies, build, generateConfig, preparationMessege)


module.exports = {start, prepareDev, prepare}
