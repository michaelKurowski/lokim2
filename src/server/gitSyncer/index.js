const config = require('../config.json')
const GitListener = require('./GitListener')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const PORT = config.gitIntegration.listeningPort
const listener = new GitListener()

app.use(bodyParser.json())
app.post('/', listener.handleHttpRequests)
app.listen(PORT, listener.handleListeningErrors)