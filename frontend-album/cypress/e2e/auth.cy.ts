describe('Autenticacion', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Login exitoso', () => {
    it('permite iniciar sesion con credenciales validas', () => {
      cy.visit('/login');

      cy.get('#username').should('be.visible');
      cy.get('#password').should('be.visible');

      cy.get('#username').type('testuser');
      cy.get('#password').type('testpass123');

      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/app');

      cy.contains('BadgeUp').should('be.visible');
    });

    it('redirige automaticamente si ya hay sesion activa', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            token: 'fake-token',
            user: { username: 'testuser' }
          }
        }));
      });

      cy.visit('/login');
      cy.url().should('include', '/app');
    });
  });

  describe('Login fallido', () => {
    it('muestra error con credenciales invalidas', () => {
      cy.visit('/login');

      cy.get('#username').type('wronguser');
      cy.get('#password').type('wrongpass');

      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/login');

      cy.contains('Credenciales').should('be.visible');
    });

    it('muestra error si el campo usuario esta vacio', () => {
      cy.visit('/login');

      cy.get('#password').type('somepassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Usuario requerido').should('be.visible');
    });

    it('no permite enviar formulario sin credenciales', () => {
      cy.visit('/login');

      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/login');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.window().then((win) => {
        win.localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            token: 'fake-token',
            refreshToken: 'fake-refresh',
            user: { username: 'testuser', first_name: 'Test' }
          }
        }));
      });
    });

    it('permite cerrar sesion correctamente', () => {
      cy.visit('/app');

      cy.contains('Salir').should('be.visible').click();

      cy.url().should('eq', Cypress.config().baseUrl + '/');

      cy.window().then((win) => {
        const storage = win.localStorage.getItem('auth-storage');
        if (storage) {
          const data = JSON.parse(storage);
          expect(data.state.token).to.be.null;
        }
      });
    });
  });
});