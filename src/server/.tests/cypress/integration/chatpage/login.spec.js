/// <reference types="Cypress" />

context('Login', () => {
	beforeEach(() => {
		cy.visit('http://localhost:5000')
	})

	it('can register', () => {
		cy.get('.home-button.btn.btn-secondary a').click()
		cy.url().should('include', '/register')
		cy.get('[name="username"]').type('test_username')
		cy.get('[name="password"]').type('test_password')
		cy.get('[name="email"]').type('testEmail@test.co.uk')
		cy.get('.register-button').click()
		cy.url().should('include', '/')
	})

	it('can login', () => {
		cy.get('[name="username"]').type('test_user')
		cy.get('[name="password"]').type('test_password')
		cy.get('input[value="Login"]').click()
		cy.url().should('include', '/chat')
		cy.get('.success')
	})

	it('can see message when login fails', () => {
		cy.get('[name="username"]').type('test_user222')
		cy.get('[name="password"]').type('test_password')
		cy.get('input[value="Login"]').click()
		cy.get('.alert-danger')
	})

	it('can logout', () => {
		cy.get('[name="username"]').type('test_user')
		cy.get('[name="password"]').type('test_password')
		cy.get('input[value="Login"]').click()
		cy.get('a.btn.btn-danger').click()
		cy.url().should('include', '/')
	})
})