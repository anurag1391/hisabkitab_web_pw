
import { expect } from '@playwright/test';

export default class SalesPage {

    constructor(page) {
        this.page = page;
    }

    // Locators
    // saleButton = "a";
    invoiceNumber = '[name="invoice_number"]';
    invoiceDate = '#datePickerInvoiceDate';
    partyDropdown = "//div[contains(text(),'Select Party')]";
    checkbox = 'input[value="false"][type="checkbox"]';

    // Verify Add Sale page
    async verifyHeading() {
        await expect(this.page.locator(this.invoiceNumber)).toBeVisible({ timeout: 30000 });
        await expect(this.page.locator(this.invoiceDate)).toBeVisible({ timeout: 30000 });
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
        await expect(dateField).not.toHaveValue('', { timeout: 15000 });
    }

    // Invoice Number Handling
    async handleInvoiceNumber() {
        const field = this.page.locator(this.invoiceNumber);
        const value = `AUTO-${Date.now()}`;
        await field.fill(value);

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

        await expect(this.page.getByText(partyName, { exact: true }).last())
            .toBeVisible({ timeout: 15000 });
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
    async selectItem(itemName = 'Aitomateitem') {
        const item = this.page.getByText('Select item').first();

        if (await item.count() > 0) {
            const currentValue = await item.textContent();

            if (currentValue?.includes('Select item')) {
                await item.click();
                await this.page.keyboard.type(itemName);
                const itemOption = this.page.getByText(itemName, { exact: true }).last();
                await expect(itemOption).toBeVisible({ timeout: 20000 });
                await itemOption.click();
            }
        }

        await expect(this.getItemRow(itemName)).toContainText(itemName, {
            timeout: 15000
        });
    }

    // Process Item Table
    async processItemTable(itemName = 'Aitomateitem', quantity = '1') {
        await this.selectItem(itemName);

        const qty = this.getItemRow(itemName).getByRole('spinbutton').first();

        await expect(qty).toBeVisible({ timeout: 15000 });
        await qty.fill(quantity);
        await expect(qty).toHaveValue(quantity);
    }

    getItemRow(itemName) {
        return this.page.getByRole('row').filter({ hasText: itemName }).last();
    }

    async verifyTransactionDetails({ invoiceNumber, partyName, itemName, quantity }) {
        await expect(this.page.locator(this.invoiceNumber))
            .toHaveValue(invoiceNumber, { timeout: 15000 });
        await expect(this.page.locator(this.invoiceDate))
            .not.toHaveValue('', { timeout: 15000 });
        await expect(this.page.getByText(partyName, { exact: true }).last())
            .toBeVisible({ timeout: 15000 });
        const itemRow = this.getItemRow(itemName);
        await expect(itemRow).toContainText(itemName, { timeout: 15000 });
        await expect(itemRow.getByRole('spinbutton').first())
            .toHaveValue(quantity, { timeout: 15000 });
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
