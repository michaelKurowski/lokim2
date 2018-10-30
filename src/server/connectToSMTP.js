const emailController = require('./routes/controllers/email')

module.exports = function(){
    return emailController.prepareTransporter()
}