# LokIM
LokIM is NodeJS & React based Instant Messanger.
## Prerequisites
 - NodeJS 10.13 or newer
## How to start (for users)
 1. Clone a repository with `git clone <repository URL>`
 2. Run `npm ci` inside root directory of repository
 3. Run `gulp prepare`
 4. Fill `/src/server/config.json` or set appropiate environmental variables.
 5. Run `gulp start`
## How to start (for development team)
 1. Clone a repository with `git clone <repository URL>`
 2. Run `npm ci` inside root directory of repository
 2. Run `gulp prepareDev`
 3. Fill `/src/server/config.json` or set appropiate environmental variables.
 4. Run `gulp start`
## Environmental variables
 - `DB_USERNAME` MongoDB Username
 - `DB_PASSWORD` MongoDB Password
 - `DB_HOSTNAME` MongoDB Hostname
 - `SMTP_HOSTNAME` SMTP Hostname
 - `SMTP_USERNAME` SMTP Email Address
 - `SMTP_PASSWORD` SMTP Password
 - `SMTP_PORT` SMTP Port
## Development specific command
### Tests
 - For unit and integration tests on backend run `gulp serverTest`
 - For unit and integration tests on frontend run `gulp frontEndTest`
 - In order to collect server test coverage, run `gulp serverTestCoverage`
 - In order to collect frontend test coverage, run `gulp frontEndTestCoverage`
 - For E2E tests run `gulp testCypress`
### Linting
 - Run `gulp eslint` to lint the whole project.
 - Run `gulp eslintAutoFix` to automatically fix trivial linting errors.
### Docs
 - Run `gulp generateDocs` to generate endpoints documentation inside the project.
## Technologies used:
* Database
    * MongoDB
* Backend
	* Express
	* Winston
	* Mongoose
	* Passport
    * **Dev tools**
        * Mocha
        * Chai
        * Node HTTP Mocks
        * Sinon
* Frontend
    * React
    * Redux
    * Redux Sagas
    * **Dev tools**
        * Jest
        * Enzyme
        * Sinon
* Dev tools
    * Eslint
    * Cypress
    * Gulp
### Supported OSes:
* Microsoft Windows (tested on 7, 10)
* Linux (tested on Manjaro 18.0.4, Arch 5.0.7, Debian Stretch)
* MacOS (tested on 10.14.3)