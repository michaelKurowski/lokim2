# Lokim project
This is a backend for LokIM Instant Messanger, focused on anonymity and security of its users.
## How to use
1. Clone a repository with `git clone <repository URL>`.
2. Configure `/src/server/config.json`.
3. Run `npm start` from `/src/server` directory in order to run the server.
## For devs
In order to run tests, run `npm test` from `/src/server`.
You can use it, and debug from inside Visual Studio Code by running `Mocha Tests` debug task.
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
