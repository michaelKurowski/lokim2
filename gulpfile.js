const {series} = require('gulp')
const exec = require('child_process').exec
const path = require('path')
const PATHS = {
    SERVER: path.resolve(__dirname, 'src', 'server'),
    FRONTEND: path.resolve(__dirname, 'src', 'server', 'frontEnd')
}

function start(cb) {
    const cliProcess = exec(`npm start --prefix ${PATHS.SERVER}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
    cliProcess.stdout.on('data', function(data) {
        console.log(data)
    })
}

function installServerDependencies(cb) {
    exec(`npm install --prefix ${PATHS.SERVER}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function installFrontEndDependencies(cb) {
    exec(`npm install --prefix ${PATHS.FRONTEND}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function buildDev(cb) {
    exec(`npm run build-dev --prefix ${PATHS.SERVER}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function build() {
    exec(`npm run build --prefix ${PATHS.SERVER}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function generateConfig(cb) {
    exec(`npm run generate-config --prefix ${PATHS.SERVER}`, function (err, stdout, stderr) {
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
