const express = require('express')
const login = require('./routes/login')
const register = require('./routes/register')
const bodyParser = require('body-parser')
const config = require('./config.json')
const app = express()


app.use(bodyParser.json())

app.use('/login',login)
app.use('/register',register)

app.listen(config.httpServer.port, (err)=> {
    if (err){
        console.log(err)
        return
    }
    console.log('Server is listening ...')
})
