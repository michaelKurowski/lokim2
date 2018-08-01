/// <reference types="Cypress" />

context('Login', () => {
	beforeEach(done => {
		require('../../../init')
			.then(() => {
				cy.visit('http://localhost:5000')
				done()
			})
	})

	it('can login', () => {
		cy.get('[name="username"]').type('test_user')
		cy.get('[name="password"]').type('test_password')
		cy.get('input[value="Login"]').click()
		cy.url().should('include', '/chat')
		cy.get('.success')
	})

	it('can logout', () => {
		cy.get('[name="username"]').type('test_user')
		cy.get('[name="password"]').type('test_password')
		cy.get('input[value="Login"]').click()
		cy.get('a.btn.btn-danger').click()
		cy.url().should('include', '/')
	})
})