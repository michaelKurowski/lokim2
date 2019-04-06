const {series, src, dest} = require('gulp')
const {exec, spawn} = require('child_process')
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
    CONFIG_GENERATOR_SERVICE: path.resolve(__dirname, 'src', 'server', 'configFileService.js'),
    MOCHA: path.resolve(__dirname, 'src', 'server', 'node_modules', 'mocha', 'bin', 'mocha')
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
    const ls = spawn(`npm`, ['install'], {cwd: PATHS.SERVER, shell: true, stdio: "inherit"})
    console.log(PATHS.SERVER)
    /*
      ls.stdout.pipe(process.stdout)
      ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
      });
       */
      ls.on('close', (code) => {
        cb()
      });
     
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
    exec(`cd ${PATHS.SERVER} && node -e 'require("${PATHS.CONFIG_GENERATOR_SERVICE}")().generateConfig()'`, function (err, stdout, stderr) {
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

function eslint(cb) {
    exec(`node ${PATHS.ESLINT} --ignore-path ${PATHS.ESLINT_IGNORE} ${PATHS.SERVER}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function eslintAutoFix(cb) {
    exec(`node ${PATHS.ESLINT} --ignore-path ${PATHS.ESLINT_IGNORE} --fix ${PATHS.SERVER}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function generateDocs(cb) {
    exec(`node ${PATHS.JSDOC} -r ${PATHS.WEBSOCKET_ROUTING_DIRECTORY} -d ${PATHS.JS_DOCS_OUTPUT_DIRECTORY}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function testCoverage(cb) {
    exec(`cd ${PATHS.SERVER} && node ${PATHS.NYC} --all --check-coverage --report-dir ${PATHS.COVERAGE_REPORT_DIRECTORY} npm test`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function testCypress(cb) {
    exec(`cd ${PATHS.SERVER} && npx cypress run `, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function frontEndTest(cb) {
    exec(`cd ${PATHS.FRONTEND} && npx jest`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function frontEndTestDebug(cb) {
    const cliProcess = exec(`node --inspect-brk ${PATHS.FRONTEND_JEST} --runInBand`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
    //jest prints stderr's instead of stdout's
    cliProcess.stderr.on('data', function(data) {
        console.log(data)
    })
}

function frontEndTestCoverage(cb) {
    const cliProcess = exec(`cd ${PATHS.FRONTEND} && jest --rootDir ${PATHS.FRONTEND} --config ${PATHS.JEST_CONFIG} --coverage > coverage.lcov`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })

    cliProcess.stdout.on('data', function(data) {
        console.log(data)
    })

    cliProcess.stderr.on('data', function(data) {
        console.log(data)
    })
}

function frontEndEslint(cb) {
    exec(`node ${PATHS.FRONTEND_ESLINT} --ignore-path ${PATHS.FRONTEND_ESLINT_IGNORE} ${PATHS.FRONTEND}`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function frontEndEslintAutoFix(cb) {
    exec(`node ${PATHS.FRONTEND_ESLINT} --ignore-path ${PATHS.FRONTEND_ESLINT_IGNORE} ${PATHS.FRONTEND} --fix`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

function serverTest(cb) {
    exec(`cd ${PATHS.SERVER} && ${PATHS.MOCHA} './.tests/mocha/**/*.spec.js'`, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    })
}

// function (cb) {
//     exec(``, function (err, stdout, stderr) {
//         console.log(stdout);
//         console.log(stderr);
//         cb(err);
//     })
// }

const buildDev = series(bundleDev, publishFrontEndBundle)
const build = series(bundle, publishFrontEndBundle)
const prepareDev = series(installServerDependencies, installFrontEndDependencies, buildDev, generateConfig, preparationMessege)
const prepare = series(installServerDependencies, installFrontEndDependencies, build, generateConfig, preparationMessege)


module.exports = {start, prepareDev, prepare, build, buildDev, eslint, eslintAutoFix, generateDocs, testCoverage, testCypress, frontEndTest, frontEndTestDebug, frontEndTestCoverage, frontEndEslint, frontEndEslintAutoFix, generateConfig, serverTest}
