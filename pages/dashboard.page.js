
import { expect } from '@playwright/test';

import { getCurrentFinancialYear } from '../utils/dateHelper.js';

export default class DashboardPage {

    constructor(page) {
        this.page = page;
    }

    // Expected company
    expectedCompany = process.env.COMPANY_NAME || 'JCOS LTD.';

    // =====================================
    // VERIFY DASHBOARD
    // =====================================

    async verifyDashboard() {

        await expect(
            this.page.getByText('Dashboard', {
                exact: true
            }).first()
        ).toBeVisible();

    }


    // =====================================
    // COMPANY SELECTION
    // =====================================

    async verifyCompany() {

        const companyName = this.expectedCompany;

        if (!companyName) {
            throw new Error('COMPANY_NAME is missing in .env');
        }

        // Locate currently displayed company
        const companyDropdown = this.page.getByText(
            companyName,
            { exact: true }
        ).first();

        // Read current company from the header dropdown
        const companyHeader = this.page.locator(
            'header button, header [role="combobox"]'
        ).first();

        let currentCompany = '';

        if (await companyHeader.count()) {
            currentCompany = (await companyHeader.innerText()).trim();
        } else if (await companyDropdown.count()) {
            currentCompany = (await companyDropdown.innerText()).trim();
        }

        console.log('Expected Company:', companyName);
        console.log('Current Company:', currentCompany);

        // Company already selected
        if (currentCompany.includes(companyName)) {

            console.log('Company already matched. Skipping selection.');

            return;
        }

        // Open company dropdown
        await companyHeader.click();

        // Search field inside opened company dropdown
        const searchField = this.page.locator('input:visible').last();

        await expect(searchField).toBeVisible();

        await searchField.fill(companyName);

        // Select matching company
        const matchingCompany = this.page.getByText(
            companyName,
            { exact: true }
        ).last();

        if (await matchingCompany.isVisible().catch(() => false)) {
            await matchingCompany.click();
        } else {
            await searchField.press('Enter');
        }

        // Verify selected company
        await expect(
            this.page.getByText(companyName, {
                exact: true
            }).first()
        ).toBeVisible();

        console.log('Company selected:', companyName);

    }


    // =====================================
    // FINANCIAL YEAR VALIDATION
    // =====================================

    async verifyFinancialYear() {

        const expectedFY = getCurrentFinancialYear();

        console.log('Expected Financial Year:', expectedFY);

        // FY dropdown in the top header
        const fyDropdown = this.page.getByRole('textbox', {
            name: /^\d{4}\s*-\s*\d{2}$/
        }).first();

        await expect(fyDropdown).toBeVisible({ timeout: 15000 });

        const currentFY = (
            await fyDropdown.innerText()
        ).replace(/\s+/g, '');

        console.log('Currently Selected FY:', currentFY);

        // Already correct
        if (currentFY === expectedFY) {

            console.log('Financial Year already matched. Skipping selection.');

            return;
        }

        // Open FY dropdown
        await fyDropdown.click();

        // Find the expected FY option
        const fyOption = this.page.getByRole('option', {
            name: new RegExp(
                `^${expectedFY.replace('-', '\\s*-\\s*')}$`
            )
        }).last();

        await expect(fyOption).toBeVisible({ timeout: 15000 });

        await fyOption.click();

        // Verify selected FY
        const updatedFY = (
            await fyDropdown.innerText()
        ).replace(/\s+/g, '');

        expect(updatedFY).toBe(expectedFY);

        console.log('Financial Year updated:', updatedFY);

    }


    // =====================================
    // VERIFY COMPLETE DASHBOARD CONTEXT
    // =====================================

    async verifyDashboardContext() {

        await this.verifyDashboard();

        await this.verifyCompany();

        await this.verifyFinancialYear();

    }


    // =====================================
    // DASHBOARD SCROLL
    // =====================================

    async verifyLowerSections() {

        await this.page.mouse.wheel(0, 1500);

        await expect(
            this.page.getByText('Cashflow', {
                exact: false
            }).first()
        ).toBeVisible();

        await expect(
            this.page.getByText('Opening Balance', {
                exact: true
            })
        ).toBeVisible();

        await expect(
            this.page.getByText('Closing Balance', {
                exact: true
            })
        ).toBeVisible();

        await expect(
            this.page.getByText('Top Selling Items', {
                exact: true
            })
        ).toBeVisible();

        await expect(
            this.page.getByText('Least Selling Items', {
                exact: true
            })
        ).toBeVisible();

    }


    // =====================================
    // OPEN SALE
    // =====================================

    async openSale() {

        // Verify company and FY before transaction
        await this.verifyCompany();

        await this.verifyFinancialYear();

        const sale = this.page
            .locator('a')
            .filter({
                hasText: 'Sale'
            })
            .first();

        await expect(sale).toBeVisible();

        await sale.click();

        await expect(
            this.page.getByRole('heading', {
                name: 'Add Sale'
            })
        ).toBeVisible();

    }

}
