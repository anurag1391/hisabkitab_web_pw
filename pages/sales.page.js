
import { expect } from '@playwright/test';

export default class SalesPage {

    constructor(page) {
        this.page = page;
    }

    // Locators
    // saleButton = "a";
    addSaleHeading = "Add Sale";
    invoiceNumber = '[name="invoice_number"]';
    invoiceDate = '#datePickerInvoiceDate';
    partyDropdown = "//div[contains(text(),'Select Party')]";
    checkbox = 'input[value="false"][type="checkbox"]';

    // Verify Add Sale page
    async verifyHeading() {
        await expect(
            this.page.getByRole('heading', { name: this.addSaleHeading })
        ).toBeVisible({ timeout: 15000 });
        await expect(this.page.locator(this.invoiceNumber)).toBeVisible({ timeout: 15000 });
        await expect(this.page.locator(this.invoiceDate)).toBeVisible({ timeout: 15000 });
    }

    // Open Sale
    async openSale() {
        await this.page.locator(this.saleButton)
            .filter({ hasText: 'Sale' })
            .first()
            .click();

        await this.verifyHeading();
    }

    // Invoice Date Verification
    async verifyInvoiceDate() {
        const dateField = this.page.locator(this.invoiceDate);
        await expect(dateField).toBeVisible({ timeout: 15000 });

        const now = new Date();
        const today = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
        const current = await dateField.inputValue();

        if (current !== today) {
            await dateField.fill(today);
            await dateField.press('Tab');
            console.warn('Invoice date updated to current date');
        }

        await expect(dateField).toHaveValue(today, { timeout: 15000 });
    }

    // Invoice Number Handling
    async handleInvoiceNumber() {
        const field = this.page.locator(this.invoiceNumber);
        let value = await field.inputValue();

        if (!value) {
            value = `AUTO-${Date.now()}`;
            await field.fill(value);
        }

        return value;
    }

    // Select Party using Keyboard
    async selectParty(partyName = 'Counter Sales') {
        const party = this.page.locator(this.partyDropdown);

        await expect(party).toBeVisible({ timeout: 15000 });
        const currentValue = await party.textContent();

        if (currentValue?.includes('Select Party')) {
            await party.click();
            await this.page.keyboard.type(partyName);
            const partyOption = this.page.getByText(partyName, { exact: true }).last();
            await expect(partyOption).toBeVisible({ timeout: 20000 });
            await partyOption.click();
        }
    }

    // Checkbox Handling
    async handleCheckbox() {
        const checkbox = this.page.locator(this.checkbox);

        if (await checkbox.count() > 0) {
            if (!(await checkbox.isChecked())) {
                await checkbox.check();
            }
        }
    }

    // Select Item using Keyboard
    async selectItem() {
        const item = this.page.getByText('Select item').first();

        if (await item.count() > 0) {
            const currentValue = await item.textContent();

            if (currentValue?.includes('Select item')) {
                await item.click();
                await this.page.keyboard.type('Aitomateitem');
                const itemOption = this.page.getByText('Aitomateitem', { exact: true }).last();
                await expect(itemOption).toBeVisible({ timeout: 20000 });
                await itemOption.click();
            }
        }
    }

    // Process Item Table
    async processItemTable() {

        await this.selectItem();

        const qty = this.page.locator('input[name="quantity"]').first();

        if (await qty.count() > 0) {
            await expect(qty).toBeVisible({ timeout: 15000 });
            const value = await qty.inputValue();

            if (!value || value === '0') {
                await qty.fill('2');
            }
        }
    }

    // Save Transaction
    async saveTransaction() {
        const saveButton = this.page.getByRole('button', {
            name: 'Save',
            exact: true
        });

        await expect(saveButton).toBeVisible({ timeout: 15000 });
        await expect(saveButton).toBeEnabled({ timeout: 15000 });
        await saveButton.scrollIntoViewIfNeeded();
        await saveButton.click();
    }
}
