describe('Flujo de Albums y Stickers', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: 'fake-token',
          refreshToken: 'fake-refresh',
          user: {
            username: 'testuser',
            first_name: 'Test',
            email: 'test@example.com'
          }
        }
      }));
    });

    cy.visit('/app');
  });

  describe('Navegacion de albums', () => {
    it('muestra la pagina principal de la aplicacion', () => {
      cy.url().should('include', '/app');
      cy.contains('BadgeUp').should('be.visible');
    });

    it('permite navegar a Mis Albumes', () => {
      cy.contains('Mis Álbumes').click();
      cy.url().should('include', '/app/albums');
    });

    it('permite navegar al Ranking', () => {
      cy.contains('Ranking').click();
      cy.url().should('include', '/app/ranking');
    });

    it('permite navegar al Perfil', () => {
      cy.contains('Test').click();
      cy.url().should('include', '/app/perfil');
    });
  });

  describe('Visualizacion de stickers', () => {
    it('permite ver un album individual', () => {
      cy.visit('/app/albums');

      cy.get('a').contains('Ver álbum').first().click({ force: true });

      cy.url().should('match', /\/app\/albums\/\d+/);
    });
  });

  describe('Perfil de usuario', () => {
    beforeEach(() => {
      cy.visit('/app/perfil');
    });

    it('muestra la informacion del usuario', () => {
      cy.contains('Test').should('be.visible');
      cy.contains('testuser').should('be.visible');
    });

    it('permite editar el perfil', () => {
      cy.contains('Editar Perfil').click();
      cy.url().should('include', '/app/perfil/editar');
    });
  });

  describe('Ranking', () => {
    beforeEach(() => {
      cy.visit('/app/ranking');
    });

    it('muestra la tabla de ranking', () => {
      cy.contains('Ranking').should('be.visible');
    });

    it('muestra columnas de usuario y puntos', () => {
      cy.contains('Usuario').should('be.visible');
      cy.contains('Puntos').should('be.visible');
    });
  });
});