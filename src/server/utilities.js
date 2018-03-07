const crypto = require('crypto')

class Utilities {

	generateSalt (size) {
		return crypto.randomBytes(size).toString('base64')
	}

	hashPassword(salt, password) {
		if(password == null)
			return null
		
		const hash = crypto.createHash('sha256')
		return  hash.update(password + salt).digest('hex')	
	}
}

module.exports = new Utilities()

