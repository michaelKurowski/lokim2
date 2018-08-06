# Lokim project
This is a backend for LokIM Instant Messanger, focused on anonymity and security of its users.
## How to use
1. Clone a repository with `git clone <repository URL>`.
2. Configure `/src/server/config.json`.
3. When starting the server for the first time, run: `npm i`, `npm run build`, and `npm start` from `/src/server` directory in.
4. After that just run `npm start` every time to start the server
## For devs
In order to run tests, run `npm test` from `/src/server`.
`npm run build-dev` to build app for dev mode
You can use it, and debug from inside Visual Studio Code by running `Mocha Tests` debug task.

To generate docs, run `npm run generate-docs`
## Technologies used:
* DB
    * MongoDB
    * Redis
* Backend
	* Express
	* Winston
	* Mongoose
	* Passport
* Dev tools
    * Eslint
    * Testing tools
        * Mocha
        * Chai
        * Node HTTP Mocks
        * Sinon
