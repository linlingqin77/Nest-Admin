/**
 * Cypress 自定义命令
 *
 * @description
 * 定义可复用的测试命令
 *
 * @requirements 12.2
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * 登录命令
       * @param username 用户名
       * @param password 密码
       */
      login(username: string, password: string): Chainable<void>;

      /**
       * 通过 API 登录（跳过 UI）
       * @param username 用户名
       * @param password 密码
       */
      loginByApi(username: string, password: string): Chainable<void>;

      /**
       * 获取 data-cy 属性的元素
       * @param selector data-cy 属性值
       */
      getByCy(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// 通过 UI 登录
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('not.include', '/login');
});

// 通过 API 登录（更快）
Cypress.Commands.add('loginByApi', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { userName: username, password }
  }).then(response => {
    if (response.body.code === 200) {
      window.localStorage.setItem('token', response.body.data.token);
    }
  });
});

// 获取 data-cy 属性的元素
Cypress.Commands.add('getByCy', (selector: string) => {
  return cy.get(`[data-cy="${selector}"]`);
});

export {};
