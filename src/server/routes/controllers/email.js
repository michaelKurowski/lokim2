const responseManager = require('./utilities/responseManager')
const config = require('../../config.json')
const nodemailer = require('nodemailer')
const logger = require('../../logger')
const crypto = require('crypto')
const _ = require('lodash')

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

async function prepareTransporter(){
    let transporter = nodemailer.createTransport(SMTP_OPTIONS)

    await transporter.verify((err) => {
        if(err) return console.log(err)
        logger.info('Email server is ready to take our messages')
    })

    return transporter
}

function createToken(){
    const token = crypto.randomBytes(20).toString('hex')
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

function sendMail(transporter = prepareTransporter()){
    return (mailOptions) => {
        if([...mailOptions].some(_.isEmpty)) throw new Error('Receive address, subject or body cannot be undefined.')
        
        transporter.sendMail(mailOptions, (err, info) => {
            if(err) return console.log(err)
            console.log('Message sent: %s', info.messageId)
        })
    }
}

function prepareVerification(VerifyModel = require('../../models/verification')){
    return (userData, host, token) => {
        const {username, email} = userData
        const link =`${host}/verify/${token}`
        const subject = 'Verification Email'
        const body = `You can activate your account at ${link} \nIt will expire after 30  days.` //TODO: Make it expire after 30 days

        const verifyData = {username, token}
        const verifyInstance = new VerifyModel(verifyData)
        
        verifyInstance.save()
            .then(() => sendMail(email, subject, body))
            .catch(err => {
                logger.info(`Email contoller error: ${err}`)
            })
    }
}

function emailVerification( //TODO: rename this, ambiguous with prepareVerification
    Verify = require('../../models/verification'),
    User = require('../../models/user')){
    return (req, res, next) => {
        const token = req.params.token
        
        if(_.isEmpty(token))
            return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)

        Verify.find({token}, (err, foundUser) => {
            if(err) 
                return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)

            const {username} = foundUser

            User.findOneAndUpdate({username}, {active: true}, (err) => { 
                if (err) return responseManager.sendResponse(res, responseManager.MESSAGES.ERRORS.BAD_REQUEST)
                Verify.remove({token}, (err) => console.log)
                return responseManager.sendResponse(res, responseManager.MESSAGES.SUCCESSES.OK)
            })
        })
    }
}

module.exports = { 
    createToken,
    mailOptions: setMailOptions,
    sendMail,
    prepareVerification,
    verifyUser: emailVerification
}