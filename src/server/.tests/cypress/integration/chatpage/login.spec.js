/// <reference types="Cypress" />
const http = require('http')
let suite
let inbox
context('Login', () => {
	beforeEach(() => {
		suite = {
			CORRECT_USERNAME: 'test_username',
			CORRECT_PASSWORD: 'test_password',
			WRONG_USERNAME: 'test_user222',
			WRONG_PASSWORD: 'wrong_password',
			EMAIL: 'testEmail@test.co.uk'
		}
		cy.visit('http://localhost:5002')
	})

	afterEach(done => {
		cy.request({
			method: 'POST',
			url: 'http://localhost:5002/logout',
			failOnStatusCode: false
		}).then(() => done())
	})

	it('can register', done => {
		cy.get('.home-button.btn.btn-secondary a').click()
		cy.url().should('include', '/register')
		cy.get('[name="username"]').type(suite.CORRECT_USERNAME)
		cy.get('[name="password"]').type(suite.CORRECT_PASSWORD)
		cy.get('[name="email"]').type(suite.EMAIL)
		cy.get('.register-button').click()
		cy.wait(2500)
		cy.request({
			method: 'GET',
			url: 'http://localhost:1080/messages/1.plain',
			failOnStatusCode: false
		}).then((data) => {
			cy.url().should('include', '/')
			throw data.body
			const hash = data.body.split('/verify/')[1].split(' ')[0]
			cy.visit(`http://localhost:5002/verify/${hash}`)
			done()
		})
	})

	it('can login', () => {
		cy.get('[name="username"]').type(suite.CORRECT_USERNAME)
		cy.get('[name="password"]').type(suite.CORRECT_PASSWORD)
		cy.get('input[value="Login"]').click()
		cy.url().should('include', '/chat')
		cy.get('.success')
	})

	it('can see message when login fails due to wrong username', () => {
		cy.get('[name="username"]').type(suite.WRONG_USERNAME)
		cy.get('[name="password"]').type(suite.CORRECT_PASSWORD)
		cy.get('input[value="Login"]').click()
		cy.get('.alert-danger')
	})

	it('can see message when login fails due to wrong password', () => {
		cy.get('[name="username"]').type(suite.CORRECT_USERNAME)
		cy.get('[name="password"]').type(suite.WRONG_PASSWORD)
		cy.get('input[value="Login"]').click()
		cy.get('.alert-danger')
	})

	it('can logout', () => {
		cy.get('[name="username"]').type(suite.CORRECT_USERNAME)
		cy.get('[name="password"]').type(suite.CORRECT_PASSWORD)
		cy.get('input[value="Login"]').click()
		cy.get('a.btn.btn-danger').click()
		cy.url().should('include', '/')
	})
})