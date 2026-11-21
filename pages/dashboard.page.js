
import { expect } from '@playwright/test';

import { getCurrentFinancialYear } from '../utils/dateHelper.js';

export default class DashboardPage {

    constructor(page) {
        this.page = page;
    }

    // Expected company
    expectedCompany = process.env.COMPANY_NAME || 'JCOS LTD.';

    // VERIFY DASHBOARD
    async verifyDashboard() {

        await expect(
            this.page.getByRole('heading', {
                name: 'Dashboard',
                exact: true
            })
        ).toBeVisible({ timeout: 15000 });

        await expect(
            this.page.getByRole('heading', {
                name: /^sales and purchase$/i
            })
        ).toBeVisible({ timeout: 15000 });

    }


    // =====================================
    // COMPANY SELECTION
    // =====================================

    async verifyCompany() {

        const companyName = this.expectedCompany;

        if (!companyName) {
            throw new Error('COMPANY_NAME is missing in .env');
        }

        const companyControl = this.page.getByRole('combobox').first();
        await expect(companyControl).toBeVisible({ timeout: 15000 });

        const companyOptions = companyControl.locator('option');
        const isNativeSelect = await companyOptions.count() > 0;
        let currentCompany;

        if (isNativeSelect) {
            currentCompany = (
                await companyControl.locator('option:checked').innerText()
            ).trim();
        } else {
            const companyInput = companyControl.locator('input').first();
            currentCompany = await companyInput.count()
                ? (await companyInput.inputValue()).trim()
                : (await companyControl.innerText()).trim();
        }

        console.log('Expected Company:', companyName);
        console.log('Current Company:', currentCompany);

        // Company already selected
        if (currentCompany.includes(companyName)) {

            console.log('Company already matched. Skipping selection.');

            return;
        }

        if (isNativeSelect) {
            const matchingCompany = (await companyOptions.allTextContents())
                .map(option => option.trim())
                .find(option => option === companyName);

            if (!matchingCompany) {
                throw new Error(`Company "${companyName}" is not available.`);
            }

            await companyControl.selectOption({ label: matchingCompany });
            await expect(
                companyControl.locator('option:checked')
            ).toHaveText(companyName);
            return;
        }

        // Open company dropdown
        await companyControl.click();

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
        const fyCombobox = this.page.getByRole('combobox').nth(1);
        await expect(fyCombobox).toBeVisible({ timeout: 15000 });

        const fyOptions = fyCombobox.locator('option');

        if (await fyOptions.count()) {
            const selectedFY = (
                await fyCombobox.locator('option:checked').innerText()
            ).replace(/\s+/g, '');

            console.log('Currently Selected FY:', selectedFY);

            if (selectedFY === expectedFY) {
                console.log('Financial Year already matched. Skipping selection.');
                return;
            }

            const matchingFY = (await fyOptions.allTextContents())
                .map(option => option.trim())
                .find(option => option.replace(/\s+/g, '') === expectedFY);

            if (!matchingFY) {
                throw new Error(`Financial Year "${expectedFY}" is not available.`);
            }

            await fyCombobox.selectOption({ label: matchingFY });
            await expect(fyCombobox.locator('option:checked'))
                .toHaveText(matchingFY);
            return;
        }

        const fyDropdown = this.page.getByRole('textbox', {
            name: /^\d{4}\s*-\s*\d{2}$/
        }).first();

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

        await this.verifyCompany();

        await this.verifyFinancialYear();

    }


    // =====================================
    // DASHBOARD SCROLL
    // =====================================

    async verifyLowerSections() {

        await this.page.mouse.wheel(0, 1500);

        await expect(
            this.page.getByRole('heading', {
                name: /^cashflow$/i
            })
        ).toBeVisible({ timeout: 15000 });

        await expect(
            this.page.getByRole('heading', {
                name: 'Top Selling Items',
                exact: true
            })
        ).toBeVisible({ timeout: 15000 });

        await expect(
            this.page.getByRole('heading', {
                name: 'Least Selling Items',
                exact: true
            })
        ).toBeVisible({ timeout: 15000 });

    }


    // =====================================
    // OPEN SALE
    // =====================================

    async openSale() {

        // Verify company and FY before transaction
        await this.verifyCompany();

        await this.verifyFinancialYear();

        const sale = this.page.getByRole('link', {
            name: /^Sale \+$/
        });

        await expect(sale).toBeVisible({ timeout: 15000 });

        await sale.click();

        await expect(
            this.page.locator('[name="invoice_number"]')
        ).toBeVisible({ timeout: 30000 });

    }

}
