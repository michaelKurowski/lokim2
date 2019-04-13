const { series, src, dest } = require('gulp')
const { spawn } = require('child_process')
const path = require('path')
const PATHS = {
    SERVER: path.resolve(__dirname, 'src', 'server'),
    SERVER_ENTRY_POINT: path.resolve(__dirname, 'src', 'server', 'index.js'),
    WEBPACK: path.resolve(__dirname, 'src', 'server', 'node_modules', '.bin', 'webpack'),
    WEBPACK_PROD_CONFIG: path.resolve(__dirname, 'src', 'server', 'prod.webpack.config.js'),
    WEBPACK_DEV_CONFIG: path.resolve(__dirname, 'src', 'server', 'dev.webpack.config.js'),
    FRONTEND: path.resolve(__dirname, 'src', 'server', 'frontEnd'),
    JEST_CONFIG: path.resolve(__dirname, 'src', 'server', 'frontEnd', 'package.json'),
    WEBPACK_GENERATED_BUNDLE: path.resolve(__dirname, 'src', 'server', 'frontEnd', 'src', 'theme', 'index.html'),
    HTTP_SERVER_PUBLIC_DIRECTORY: path.resolve(__dirname, 'src', 'server', 'public'),
    ESLINT: path.resolve(__dirname, 'src', 'server', 'node_modules', 'eslint', 'bin', 'eslint.js'),
    ESLINT_IGNORE: path.resolve(__dirname, 'src', 'server', '.eslintignore'),
    JSDOC: path.resolve(__dirname, 'src', 'server', 'node_modules', 'jsdoc', 'jsdoc'),
    WEBSOCKET_ROUTING_DIRECTORY: path.resolve(__dirname, 'src', 'server', 'ws-routes'),
    NYC: path.resolve(__dirname, 'src', 'server', 'node_modules', 'nyc', 'bin', 'nyc'),
    COVERAGE_REPORT_DIRECTORY: path.resolve(__dirname, 'coverage'),
    TEST_CYPRESS: path.resolve(__dirname, 'src', 'server', 'runCypress.js'),
    FRONTEND_ESLINT: path.resolve(__dirname, 'src', 'server', 'frontEnd', 'node_modules', 'eslint', 'bin', 'eslint.js'),
    FRONTEND_ESLINT_IGNORE: path.resolve(__dirname, 'src', 'server', 'frontEnd', '.eslintignore'),
    JS_DOCS_OUTPUT_DIRECTORY: path.resolve(__dirname, 'src', 'server', 'out'),
    FRONTEND_JEST: path.resolve(__dirname, 'src', 'server', 'frontEnd', 'node_modules', '.bin', 'jest'),
    FRONTEND_TEST_COVERAGE: path.resolve(__dirname, 'src', 'server', 'frontEnd', 'coverage.lcov'),
    CONFIG_GENERATOR_SERVICE: './configFileService.js',
    MOCHA: path.resolve(__dirname, 'src', 'server', 'node_modules', 'mocha', 'bin', 'mocha')
}

function start(cb) {
    const childProcess = spawn(`node ${PATHS.SERVER_ENTRY_POINT}`, { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

//internal function
function installServerDependencies(cb) {
    const childProcess = spawn('npm install', { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

//internal function
function installFrontEndDependencies(cb) {
    const childProcess = spawn('npm install', { cwd: PATHS.FRONTEND, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

//internal function
function bundleDev(cb) {
    const childProcess = spawn(`npx ${PATHS.WEBPACK}`, ['--config', PATHS.WEBPACK_DEV_CONFIG], { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

//internal function
function bundle(cb) {
    const childProcess = spawn(`npx ${PATHS.WEBPACK}`, ['--config', PATHS.WEBPACK_PROD_CONFIG], { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

function generateConfig(cb) {
    childProcess = spawn('node', ['-e', `"require('${PATHS.CONFIG_GENERATOR_SERVICE}')().generateConfig()"`], { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

//internal function
function preparationMessege(cb) {
    console.log('Now fill /src/server/config.json or set environmental variables')
    cb();
}

//internal function
function publishFrontEndBundle(cb) {
    src(PATHS.WEBPACK_GENERATED_BUNDLE)
        .pipe(dest(PATHS.HTTP_SERVER_PUBLIC_DIRECTORY))
    cb();
}

function serverEslint(cb) {
    const childProcess = spawn(`node ${PATHS.ESLINT}`, ['--ignore-path', PATHS.ESLINT_IGNORE, PATHS.SERVER], { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

function serverEslintAutoFix(cb) {
    const childProcess = spawn(`node ${PATHS.ESLINT}`, ['--ignore-path', PATHS.ESLINT_IGNORE, '--fix', PATHS.SERVER], { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

function generateDocs(cb) {
    const childProcess = spawn(`node ${PATHS.JSDOC}`, ['-r', PATHS.WEBSOCKET_ROUTING_DIRECTORY, '-d', PATHS.JS_DOCS_OUTPUT_DIRECTORY], { cwd: PATHS.SERVER, shell: true, stdio: 'inherit' })
    childProcess.on('close', (data) => {
        cb()
    })
}

function serverTestCoverage(cb) {
    const childProcess = spawn(`node ${PATHS.NYC}`, ['--all', '--check-coverage', '--report-dir', PATHS.COVERAGE_REPORT_DIRECTORY, 'npm', 'test'], {cwd: PATHS.SERVER, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function testCypress(cb) {
    const childProcess = spawn('npx cypress run', {cwd: PATHS.SERVER, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function frontEndTest(cb) {
    const childProcess = spawn('npx jest', {cwd: PATHS.FRONTEND, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function frontEndTestDebug(cb) {
    const childProcess = spawn('node', ['--inspect-brk', PATHS.FRONTEND_JEST, '--runInBand'], {cwd: PATHS.FRONTEND, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function frontEndTestCoverage(cb) {
    const childProcess = spawn('npx jest', ['--rootDir', PATHS.FRONTEND, '--config', PATHS.JEST_CONFIG, '--coverage > coverage.lcov'], {cwd: PATHS.FRONTEND, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function frontEndEslint(cb) {
    const childProcess = spawn(`node ${PATHS.FRONTEND_ESLINT}`, ['--ignore-path', PATHS.FRONTEND_ESLINT_IGNORE, PATHS.FRONTEND], {cwd: PATHS.FRONTEND, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function frontEndEslintAutoFix(cb) {
    const childProcess = spawn(`node ${PATHS.FRONTEND_ESLINT}`, ['--ignore-path', PATHS.FRONTEND_ESLINT_IGNORE, '--fix', PATHS.FRONTEND], {cwd: PATHS.FRONTEND, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
}

function serverTest(cb) {
    const childProcess = spawn(`${PATHS.MOCHA} './.tests/mocha/**/*.spec.js'`, {cwd: PATHS.SERVER, shell: true, stdio: 'inherit'})
    childProcess.on('close', (data) => {
        cb()
    })
    childProcess.on('error', (data) => {
        throw data
    })
}

const build = series(bundle, publishFrontEndBundle)
const buildDev = series(bundleDev, publishFrontEndBundle)
const prepare = series(installServerDependencies, installFrontEndDependencies, build, generateConfig, preparationMessege)
const prepareDev = series(installServerDependencies, installFrontEndDependencies, buildDev, generateConfig, preparationMessege)
const eslint = series(serverEslint, frontEndEslint)
const test = series(serverTest, frontEndTest)

module.exports = {
    //functions
    start,
    generateConfig,
    serverEslint,
    serverEslintAutoFix,
    generateDocs,
    serverTestCoverage,
    testCypress,
    frontEndTest,
    frontEndTestDebug,
    frontEndTestCoverage,
    frontEndEslint,
    frontEndEslintAutoFix,
    serverTest,
    //series
    build,
    buildDev,
    prepare,
    prepareDev,
    eslint,
    test
    }