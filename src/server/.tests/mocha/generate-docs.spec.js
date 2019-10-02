const spawn = require('child_process').spawn
const assert = require('chai').assert
const path = require('path')
const CURRENT_PATH = path.resolve(__dirname)

describe('generating docs', () => {
	it('should exit with code 0 (no errors)', done => {
		const COMMAND_CONFIG = {cwd: CURRENT_PATH, shell: true}
		const COMMAND = 'npx'
		const COMMAND_ARGUMENTS = ['gulp', 'generateDocs']

		const generateDocs = spawn(COMMAND, COMMAND_ARGUMENTS, COMMAND_CONFIG)

		generateDocs.on('close', code => {
			const EXPECTED_EXIT_CODE = 0
			assert.strictEqual(code, EXPECTED_EXIT_CODE)
			done()
		})
	})
})