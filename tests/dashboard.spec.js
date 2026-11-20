import { test, expect } from '../fixtures/baseTest.js';

import DashboardPage from '../pages/dashboard.page.js';


test(
    'Dashboard - Verify Company, FY and Dashboard Sections',
    async ({ loggedPage }) => {

        const dashboard = new DashboardPage(loggedPage);

        // Step 1: Verify Dashboard
        await dashboard.verifyDashboard();

        // Step 2: Verify Company and select if mismatched
        await dashboard.verifyCompany();

        // Step 3: Verify Financial Year and select if mismatched
        await dashboard.verifyFinancialYear();

        // Step 4: Verify lower dashboard sections
        await dashboard.verifyLowerSections();

        // Step 5: Verify Dashboard URL
        await expect(loggedPage)
            .toHaveURL(/company\/dashboard/);

    }
);