const crypto = require('crypto')

class Utilities {

	static generateSalt (size) {
		return crypto.randomBytes(size).toString('base64')
	}

	static createSaltedHash(salt, passpharse) {
		if(passpharse == null || salt == null)
			return null
		
		const hash = crypto.createHash('sha256')
		return  hash.update(passpharse + salt).digest('hex')	
	}

	static createError(textMessage) {
		return {
			desc: textMessage
		}
	}
}

module.exports = Utilities

