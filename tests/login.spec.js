import { test, expect } from '../fixtures/baseTest.js';

test('HisabKitab Login Test', async ({ loggedPage }) => {
    await expect(loggedPage).toHaveURL(/company\/dashboard/);

});