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

function run (command, workingDirectory, commandArguments = []) {
    return new Promise(resolve => {
        const childProcess = spawn(command, commandArguments, {cwd: workingDirectory, shell: true, stdio: 'inherit', detached: false})
        childProcess.on('exit', (exitCode) => {
            if (exitCode !== 0) throw `COMMAND FAILED > ${command}`
            resolve()
        })
    })
}

function start() {
    return run(`node ${PATHS.SERVER_ENTRY_POINT}`, PATHS.SERVER)
}

//internal function
function installServerDependencies(cb) {
    return run('npm install', PATHS.SERVER)
}

//internal function
function installFrontEndDependencies(cb) {
    return run('npm install', PATHS.FRONTEND)
}

//internal function
function bundleDev(cb) {
    return run(`npx ${PATHS.WEBPACK}`, PATHS.SERVER, ['--config', PATHS.WEBPACK_DEV_CONFIG])
}

//internal function
function bundle(cb) {
    return run(`npx ${PATHS.WEBPACK}`, PATHS.SERVER, ['--config', PATHS.WEBPACK_PROD_CONFIG])
}

function generateConfig(cb) {
    return run('node', PATHS.SERVER, ['-e', `"require('${PATHS.CONFIG_GENERATOR_SERVICE}')().generateConfig()"`])
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
    return run(`node ${PATHS.ESLINT}`, PATHS.SERVER, ['--ignore-path', PATHS.ESLINT_IGNORE, PATHS.SERVER])
}

function serverEslintAutoFix(cb) {
    return run(`node ${PATHS.ESLINT}`, PATHS.SERVER, ['--ignore-path', PATHS.ESLINT_IGNORE, '--fix', PATHS.SERVER])
}

function generateDocs(cb) {
    return run(`node ${PATHS.JSDOC}`, PATHS.SERVER, ['-r', PATHS.WEBSOCKET_ROUTING_DIRECTORY, '-d', PATHS.JS_DOCS_OUTPUT_DIRECTORY])
}

function serverTestCoverage(cb) {
    return run(`node ${PATHS.NYC}`, PATHS.SERVER, ['--all', '--check-coverage', '--report-dir', PATHS.COVERAGE_REPORT_DIRECTORY, 'npm', 'test'])
}

function testCypress(cb) {
    return run('npx cypress run', PATHS.SERVER)
}

function frontEndTest(cb) {
    return run('npx jest', PATHS.FRONTEND)
}

function frontEndTestDebug(cb) {
    return run('node', PATHS.FRONTEND, ['--inspect-brk', PATHS.FRONTEND_JEST, '--runInBand'])
}

function frontEndTestCoverage(cb) {
    return run('npx jest', PATHS.FRONTEND, ['--rootDir', PATHS.FRONTEND, '--config', PATHS.JEST_CONFIG, '--coverage > coverage.lcov'])
}

function frontEndEslint(cb) {
    return run(`node ${PATHS.FRONTEND_ESLINT}`, PATHS.FRONTEND, ['--ignore-path', PATHS.FRONTEND_ESLINT_IGNORE, PATHS.FRONTEND])
}

function frontEndEslintAutoFix(cb) {
    return run(`node ${PATHS.FRONTEND_ESLINT}`, PATHS.FRONTEND, ['--ignore-path', PATHS.FRONTEND_ESLINT_IGNORE, '--fix', PATHS.FRONTEND])
}

function serverTest(cb) {
    return run('npx mocha "./.tests/mocha/**/*.spec.js"', PATHS.SERVER)
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