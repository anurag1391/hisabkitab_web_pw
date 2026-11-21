
import { test as base } from '@playwright/test';
import LoginPage from '../pages/login.page.js';
import DashboardPage from '../pages/dashboard.page.js';

export const test = base.extend({
  loggedPage: async ({ page }, use) => {

    const login = new LoginPage(page);

    await login.navigate();
    await login.login(process.env.LOGIN_PHONE, process.env.LOGIN_PASSWORD);
    await page.waitForURL(/\/company\/dashboard/, {
      waitUntil: 'commit',
      timeout: 30000
    });

    const dashboard = new DashboardPage(page);
    await dashboard.verifyDashboardContext();

    await use(page);
  }
});

export const expect = base.expect;
