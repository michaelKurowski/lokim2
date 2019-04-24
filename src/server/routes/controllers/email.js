const config = require('../../config.json')
const nodemailer = require('nodemailer')
const logger = require('../../logger')
const crypto = require('crypto')
const _ = require('lodash')

const account = config.email
const EMAIL_SENDER = account.email || process.env.SMTP_USERNAME
const LOKIM_EMAIL = `"Lokim Messenger Services" <${EMAIL_SENDER}>`
const INVALID_TOKEN = 'Invalid token.'
const USER_NOT_FOUND = 'User not found.'


const SMTP_OPTIONS = {
	host: account.hostname || process.env.SMTP_HOSTNAME,
	port: account.port || process.env.SMTP_PORT,
	secure: false,
	auth: {
		user: EMAIL_SENDER,
		pass: account.password || process.env.SMTP_PASSWORD
	}
}

function prepareTransporter() {
	let transporter = nodemailer.createTransport(SMTP_OPTIONS)
	
	return transporter
}

function createToken() {
	const token = crypto.randomBytes(20).toString('hex')
	return token
}

function setMailOptions(recvAddress, subject, body) {
	return {
		from: LOKIM_EMAIL,
		to: recvAddress,
		subject,
		text: body
	}
}

function sendMail(transporter = prepareTransporter()) {
	return (mailOptions) => {
		_.forEach(mailOptions, optionValue => {
			if(_.isEmpty(optionValue)) throw new Error('Mail options cannot be undefined.')
		})

		transporter.sendMail(mailOptions, (err, info) => {
			if(err) return logger.warn(`Email failed to send. Details: ${err}`)
			logger.info('Message sent: %s', info.messageId)
		})
	}
}

function saveRecordToDB(VerifyModel = require('../../models/verification')) {
	return (username, token) => {
		if(_.isEmpty(username) || _.isEmpty(token)) throw new Error('You must provide a username and verification token.')

		const verifyData = {username, token}
		const verifyInstance = new VerifyModel(verifyData)
        
		return verifyInstance.save().catch(err => {throw new Error('Error creating Verify record. Please ensure details are unique. More details: ' + err)})//TODO: Handle this better
	}
}

function sendVerificationMail(transporter = prepareTransporter()) {
	return (email, hostname, verificationToken) => {
		if(_.isEmpty(email) || _.isEmpty(hostname) || _.isEmpty(verificationToken))
			throw new Error('You must provide a hostname, email and verification token.')

		const link =`${hostname}/verify/${verificationToken}`
		const subject = 'Verification Email'
		const body = `You can activate your account at ${link} \nIt will expire after 30  days.`

		sendMail(transporter)(setMailOptions(email, subject, body))
	}
}

function verifyUser(
	Verify = require('../../models/verification'),
	User = require('../../models/user')) {
	return (req, res) => {
		const token = req.params.token

		if(_.isEmpty(token)) {
			logger.error(INVALID_TOKEN, req)
			return INVALID_TOKEN
		}

		return findUsername(token, Verify)
			.catch(() => {
				res.redirect('/email-is-invalid')
				return INVALID_TOKEN
			})
			.then(username => {
				User.findOneAndUpdate({username}, {$set: {active: true}}, (err) => { 
					if (err) {
						logger.error(USER_NOT_FOUND, req)
						res.redirect('/email-is-invalid')
						return USER_NOT_FOUND
					}
					res.redirect('/email-is-valid')
					return Verify.remove({token})
				})
			})


	}
}

function findUsername(token, Verify) {
	return Verify.findOne({token})
		.then(foundUser => foundUser.username)
}

module.exports = { 
	createToken,
	mailOptions: setMailOptions,
	sendMail,
	saveRecordToDB,
	sendVerificationMail,
	prepareTransporter,
	verifyUser
}