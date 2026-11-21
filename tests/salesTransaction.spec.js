
import { test, expect } from '../fixtures/baseTest.js';
import DashboardPage from '../pages/dashboard.page.js';
import SalesPage from '../pages/sales.page.js';

test('Sales Transaction Full Flow', async ({ loggedPage }) => {
test.setTimeout(90000);

const dashboard=new DashboardPage(loggedPage);
const sales=new SalesPage(loggedPage);

await dashboard.openSale();

await sales.verifyHeading();

await sales.verifyInvoiceDate();

const partyName = 'Counter Sales';
const itemName = 'Aitomateitem';
const quantity = '1';
await sales.selectParty(partyName);

await sales.processItemTable(itemName, quantity);

const savedInvoice = await sales.handleInvoiceNumber();

const transactionDetails = {
    invoiceNumber: savedInvoice,
    partyName,
    itemName,
    quantity
};
await sales.verifyTransactionDetails(transactionDetails);

const saveResponsePromise = loggedPage.waitForResponse(
    response =>
        response.url().includes('/react-api/sale-transactions') &&
        response.request().method() === 'POST',
    { timeout: 30000 }
);
await sales.saveTransaction();
const saveResponse = await saveResponsePromise;
expect(saveResponse.ok()).toBeTruthy();

expect(savedInvoice).not.toBe('');

await loggedPage.goto('/company/sales', { waitUntil: 'domcontentloaded' });
await expect(
    loggedPage.getByRole('heading', { name: 'Sale', exact: true })
).toBeVisible({ timeout: 15000 });

const dateRange = loggedPage.getByRole('textbox', {
    name: 'dd-mm-yyyy - dd-mm-yyyy'
});
await dateRange.fill('01-01-2020 - 31-12-2030');
await dateRange.press('Enter');

const invoiceSearch = loggedPage.getByRole('row').nth(2).getByRole('textbox').nth(3);
await invoiceSearch.fill(savedInvoice);
await expect(
    loggedPage.getByRole('row').filter({ hasText: savedInvoice })
).toBeVisible({ timeout: 20000 });

console.log(`Sale created successfully: ${savedInvoice}`);
});
