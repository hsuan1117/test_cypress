
describe("run.test.js", () => {
    it('Test row exist', () => {
        cy.visit('index.html')
        cy.get('.row').should('have.length', 1)
    })
})
