const crypto = require('crypto')
const nodemailer = require('nodemailer')
const HASH_ALGORITHM = 'sha256'
const DIGEST_METHOD = 'hex'

function createToken(){
    const currentDate = (new Date().valueOf().toString())
    const random = Math.random().toString()

    const hash = crypto.createHash(HASH_ALGORITHM)
    const token = hash.update(currentDate + random).digest(DIGEST_METHOD)
    return token
}

module.exports.createToken = createToken