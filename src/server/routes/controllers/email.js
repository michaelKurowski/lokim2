const crypto = require('crypto')
const HASH_ALGORITHM = 'sha256'
const DIGEST_METHOD = 'hex'
const SECRET = process.env.SECRET_KEY || config.SECRET_KEY || 'supersecretkey'

function createToken(){
    const hash = crypto.createHmac(HASH_ALGORITHM, SECRET)
                .digest(DIGEST_METHOD)
    return hash
}

module.exports.createToken = createToken