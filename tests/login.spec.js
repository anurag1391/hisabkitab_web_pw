import { test, expect } from '@playwright/test';
import LoginPage from '../pages/login.page.js';

test('HisabKitab Login Test', async ({ page }) => {

    const login = new LoginPage(page);

    await login.navigate();

    await login.login(
        process.env.LOGIN_PHONE,
        process.env.LOGIN_PASSWORD
    );

    await expect(page).toHaveURL(/company\/dashboard/);

    // await expect(page.getByText('Dashboard')).toBeVisible();

});