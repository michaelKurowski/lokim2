let dbConnection
module.exports = {
	setDbConnection(connectionToStore) {
		dbConnection = connectionToStore
	},

	getDbConnection() {
		return dbConnection
	}
}