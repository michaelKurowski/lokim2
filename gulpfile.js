const {series, src, dest} = require('gulp')
const exec = require('child_process').exec
const path = require('path')
const PATHS = {
    SERVER: path.resolve(__dirname, 'src', 'server'),
    SERVER_ENTRY_POINT: path.resolve(__dirname, 'src', 'server', 'index.js'),
    WEBPACK: path.resolve(__dirname, 'src', 'server', 'node_modules', '.bin', 'webpack'),
    WEBPACK_PROD_CONFIG: path.resolve(__dirname, 'src', 'server', 'prod.webpack.config.js'),
    WEBPACK_DEV_CONFIG: path.resolve(__dirname, 'src', 'server', 'dev.webpack.config.js'),
    FRONTEND: path.resolve(__dirname, 'src', 'server', 'frontEnd'),
    WEBPACK_GENERATED_BUNDLE: path.resolve(__dirname, 'src', 'server', 'frontEnd', 'src', 'theme', 'index.html'),
    HTTP_SERVER_PUBLIC_DIRECTORY: path.resolve(__dirname, 'src', 'server', 'public')
}

function start(cb) {
    const cliProcess = exec(`cd ${PATHS.SERVER} && node ${PATHS.SERVER_ENTRY_POINT}`, function (err, stdout, stderr) {
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

function bundleDev(cb) {
    exec(`cd ${PATHS.SERVER} && node ${PATHS.WEBPACK} --config ${PATHS.WEBPACK_DEV_CONFIG}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function bundle() {
    exec(`cd ${PATHS.SERVER} && node ${PATHS.WEBPACK} --config ${PATHS.WEBPACK_PROD_CONFIG}`, function (err, stdout, stderr) {
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

function publishFrontEndBundle(cb) {
    src(PATHS.WEBPACK_GENERATED_BUNDLE)
        .pipe(dest(PATHS.HTTP_SERVER_PUBLIC_DIRECTORY))
    cb();
}


const buildDev = series(bundleDev, publishFrontEndBundle)
const build = series(bundle, publishFrontEndBundle)
const prepareDev = series(installServerDependencies, installFrontEndDependencies, buildDev, generateConfig, preparationMessege)
const prepare = series(installServerDependencies, installFrontEndDependencies, build, generateConfig, preparationMessege)


module.exports = {start, prepareDev, prepare, build, buildDev}
