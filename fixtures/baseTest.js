
import { test as base } from '@playwright/test';
import LoginPage from '../pages/login.page.js';

export const test = base.extend({
  loggedPage: async ({ page }, use) => {

    const login = new LoginPage(page);

    await login.navigate();
    await login.login(process.env.LOGIN_PHONE, process.env.LOGIN_PASSWORD);
    await page.waitForURL(/\/company\/dashboard/, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await use(page);
  }
});

export const expect = base.expect;
