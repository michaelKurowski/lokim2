const crypto = require('crypto')
const nodemailer = require('nodemailer')
const logger = require('../../logger')
const _ = require('lodash')
const config = require('../../config.json')

const HEX = 'hex'

const testAccount = {
    email: process.env.EMAIL || config.email.email,
    password: process.env.EMAIL_PASSWORD || config.email.password,
    host: process.env.EMAIL_HOST || config.email.host
}

const SMTP_OPTIONS = { //TODO: Add SMTPS
    host: `smtp.${testAccount.host}`,
    port: 587,
    secure: false,
    auth: {
        user: testAccount.email,
        pass: testAccount.password
    }
}

let transporter = nodemailer.createTransport(SMTP_OPTIONS)

logger.info(SMTP_OPTIONS)
transporter.verify((err) => {
    if(err) return console.log(err)
    logger.info('Email server is ready to take our messages')
})

function createToken(){
    const token = crypto.randomBytes(20).toString(HEX)
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