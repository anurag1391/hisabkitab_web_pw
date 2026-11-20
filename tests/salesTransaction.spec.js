
import { test, expect } from '../fixtures/baseTest.js';
import DashboardPage from '../pages/dashboard.page.js';
import SalesPage from '../pages/sales.page.js';
import { getRandomParty } from '../utils/apiManager.js';

test('Sales Transaction Full Flow', async ({ loggedPage, request }) => {

const dashboard=new DashboardPage(loggedPage);
const sales=new SalesPage(loggedPage);

await dashboard.openSale();

await sales.verifyHeading();

await sales.verifyInvoiceDate();

let party='Counter Sales';

try{

party=await getRandomParty(request);

}catch{}

await sales.selectParty(party);

await sales.processItemTable();

const invoiceField = loggedPage.locator('[name="invoice_number"]');
await expect(invoiceField).not.toHaveValue('', { timeout: 15000 });
const savedInvoice = await invoiceField.inputValue();

await sales.saveTransaction();

expect(savedInvoice).not.toBe('');

await expect(loggedPage).toHaveURL(/\/company\/sales(?:\?.*)?$/, { timeout: 20000 });

const invoiceSearch = loggedPage.getByRole('row').nth(2).getByRole('textbox').nth(3);
await invoiceSearch.fill(savedInvoice);
await expect(
    loggedPage.getByRole('row').filter({ hasText: savedInvoice })
).toBeVisible({ timeout: 20000 });

console.log(`Sale created successfully: ${savedInvoice}`);
});
