const crypto = require('crypto')
const nodemailer = require('nodemailer')
const logger = require('../../logger')
const _ = require('lodash')

const HASH_ALGORITHM = 'sha256'
const DIGEST_METHOD = 'hex'

const testAccount = {
    email: process.env.EMAIL,
    password: process.env.EMAIL_PASSWORD,
    host: process.env.EMAIL_HOST
}

const SMTP_OPTIONS = {
    host: testAccount.host,
    port: 587,
    secure: false,
    auth: {
        user: testAccount.email,
        pass: testAccount.password
    }
}

let transporter = nodemailer.createTransport(SMTP_OPTIONS)

transporter.verify((err) => {
    if(err) return console.log(err)
    logger.info('Server is ready to take our messages')
})

function createToken(){
    const currentDate = (new Date().valueOf().toString())
    const random = Math.random().toString()

    const hash = crypto.createHash(HASH_ALGORITHM)
    const token = hash.update(currentDate + random).digest(DIGEST_METHOD)
    return token
}

function setMailOptions(recvAddress, subject, body){
    return {
        from: '"Lokim Messenger Services" <lokim.messenger@mail.com>',
        to: recvAddress,
        subject,
        text: body
    }
}

function sendMail(recvAddress, subject, body){
    if([recvAddress, subject, body].some(_.isEmpty)) throw new Error('Receive address, subject or body cannot be undefined.')

    const mailOptions = setMailOptions(recvAddress, subject, body)
    
    transporter.sendMail(mailOptions, (err, info) => {
        if(err) return console.log(err)
        console.log('Message sent: %s', info.messageId)
    })
}

module.exports = { 
    createToken,
    mailOptions: setMailOptions,
    sendMail   
}