describe('Registro de usuario', () => {
  beforeEach(() => {
    cy.visit('/registro');
  });

  describe('Registro exitoso', () => {
    it('permite registrar un nuevo usuario con datos validos', () => {
      const timestamp = Date.now();
      const username = `user${timestamp}`;
      const email = `user${timestamp}@test.com`;

      cy.get('#username').type(username);
      cy.get('#firstName').type('Test');
      cy.get('#lastName').type('User');
      cy.get('#email').type(email);
      cy.get('#password').type('password123');
      cy.get('#passwordConfirm').type('password123');

      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/app', { timeout: 10000 });
    });
  });

  describe('Validaciones de registro', () => {
    it('muestra error si las contrasenas no coinciden', () => {
      cy.get('#username').type('testuser');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('password123');
      cy.get('#passwordConfirm').type('password456');

      cy.get('button[type="submit"]').click();

      cy.contains('no coinciden').should('be.visible');
    });

    it('muestra error si la contrasena es muy corta', () => {
      cy.get('#username').type('testuser');
      cy.get('#email').type('test@example.com');
      cy.get('#password').type('short');
      cy.get('#passwordConfirm').type('short');

      cy.get('button[type="submit"]').click();

      cy.contains('8 caracteres').should('be.visible');
    });

    it('muestra error si faltan campos obligatorios', () => {
      cy.get('#password').type('password123');
      cy.get('#passwordConfirm').type('password123');

      cy.get('button[type="submit"]').click();

      cy.contains('Completa todos los campos').should('be.visible');
    });

    it('valida el formato del email', () => {
      cy.get('#email').should('have.attr', 'type', 'email');
    });
  });

  describe('Navegacion', () => {
    it('permite navegar al login desde el registro', () => {
      cy.contains('Inicia sesión aquí').click();

      cy.url().should('include', '/login');
    });
  });
});