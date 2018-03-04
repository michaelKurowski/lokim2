const express = require('express')
const router = express.Router()
const UserModel = require('../models/user')


router.get('/', (req, res) => {
    res.send('This will be regi page')
})

router.post('/', (req, res) => {
    console.log(req.body)
    UserModel(req.body)
        .then(()=> res.send('User has been created'))
        .catch((err) => {
            console.log(err)
            res.send(err)
        })
})


module.exports = router
