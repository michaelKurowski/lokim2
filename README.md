# LokIM
LokIM is NodeJS & React based Instant Messanger.
## Prerequisites
 - NodeJS 8.0 or newer
## How to start (for users)
 1. Clone a repository with `git clone <repository URL>`
 2. Run `npm run prepare` inside root directory of the repository
 3. Fill `/src/server/config.json` or set appropiate environmental variables.
 4. Run `npm start` inside root directory of the repository
## How to start (for development team)
 1. Clone a repository with `git clone <repository URL>`
 2. Run `npm run prepare-dev` inside root directory of the repository
 3. Fill `/src/server/config.json` or set appropiate environmental variables.
 4. Run `npm start` inside root directory of the repository
## Environmental variables
 - `DB_USERNAME` MongoDB Username
 - `DB_PASSWORD` MongoDB Password
 - `DB_HOSTNAME` MongoDB Hostname
## Development specific command
### Tests
 - For unit and integration tests on backend run `npm test` in `/src/server`
 - For unit and integration tests on frontend run `npm test` in `/src/server/frontEnd/`
 - In order to collect server test coverage, run `npm run test-coverage` in `src/server/`
 - In order to collect frontend test coverage, run `npm run test-coverage` in `src/server/frontEnd/`
 - For E2E tests run `npm run test-cypress`
### Linting
 - Run `npm run eslint` in `src/server/` to lint the whole project.
 - Run `npm run eslint-auto-fix` in `src/server/` to automatically fix trivial linting errors.
### Docs
 - Run `npm run generate-docs` in `src/server/` to generate endpoints documentation inside the project.
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

