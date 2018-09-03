const crypto = require('crypto')
const HASH_ALGORITHM = 'sha256'
const DIGEST_METHOD = 'hex'

function createToken(USER_ID){
    const hash = crypto.createHmac(HASH_ALGORITHM, USER_ID)
                .digest(DIGEST_METHOD)
    return hash
}

module.exports.createToken = createToken