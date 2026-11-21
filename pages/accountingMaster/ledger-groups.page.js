import { expect } from '@playwright/test';

export default class LedgerGroupsPage {

    constructor(page) {
        this.page = page;
    }


    // Open Groups page
    async open() {
        await this.page.waitForURL(/\/company\/dashboard/, {
            waitUntil: 'commit',
            timeout: 30000
        });

        await this.page.goto(
            process.env.GROUPS_URL || '/company/groups',
            { waitUntil: 'domcontentloaded' }
        );
        await this.page.waitForLoadState('networkidle', { timeout: 20000 });

        await expect(
            this.page.getByText('Groups', {
                exact: true
            }).first()
        ).toBeVisible({ timeout: 15000 });

    }


    // Search box
    async searchBox() {

        return this.page.getByRole('table').getByRole('textbox').first();

    }


    // Find group row
    findGroupRow(name) {

        return this.page
            .locator('tr:visible')
            .filter({
                hasText: name
            })
            .first();

    }

    groupNameMatcher(name) {

        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`^\\s*${escapedName}\\s*$`, 'i');

    }


    // Check group exists
    async groupExists(name) {

        const search = await this.searchBox();

        await search.fill(name);
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });

        const found = await this.findGroupRow(name)
            .isVisible()
            .catch(() => false);

        await search.clear();
        await this.page.waitForLoadState('networkidle', { timeout: 15000 });

        return found;

    }


    // Open Add Group
    async openAdd() {

        await this.page
            .getByRole('button', {
                name: /Group/i
            })
            .last()
            .click();

        await expect(
            this.page.getByText('Add Group', {
                exact: true
            })
        ).toBeVisible();

    }


    // Group Name
    async nameField() {

        return this.page.getByRole('dialog').getByRole('textbox').first();

    }


    // Parent Group dropdown
    async parentControl() {

        return this.page.getByRole('dialog')
            .locator('select:visible')
            .last();

    }


    // Get all Parent Group options
    async collectParentOptions() {

        const select = await this.parentControl();

        if (await select.count()) {
            await expect(select.locator('option').nth(1))
                .toBeAttached({ timeout: 15000 });

            const values = await select
                .locator('option')
                .allTextContents();

            const options = values
                .map(v => v.trim())
                .filter(Boolean);

            console.log(
                'Parent Group dropdown options:',
                options
            );

            return options;

        }


        // Custom dropdown fallback
        const dialog = this.page.getByRole('dialog');
        const label = dialog
            .getByText('Parent Group', {
                exact: false
            })
            .last();

        await label.click();
        const listbox = this.page.getByRole('listbox');
        await expect(listbox).toBeVisible({ timeout: 15000 });

        const options = await listbox
            .getByRole('option')
            .allTextContents()
            .catch(() => []);

        const cleaned = options
            .map(v => v.trim())
            .filter(Boolean);

        await this.page.keyboard.press('Escape');
        await expect(listbox).toBeHidden();

        console.log(
            'Parent Group dropdown options:',
            cleaned
        );

        return cleaned;

    }

    async closeAdd() {
        const dialog = this.page.getByRole('dialog');
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
        await expect(dialog).toBeHidden();
    }


    // Select Parent Group
    async selectParent(
        name,
        method = 'keyboard'
    ) {

        const select = await this.parentControl();

        if (await select.count()) {

            await select.selectOption({
                label: name
            });

            return;

        }


        await this.page
            .getByText('Parent Group', {
                exact: false
            })
            .last()
            .click();

        const listbox = this.page.getByRole('listbox');
        await expect(listbox).toBeVisible({ timeout: 15000 });
        const option = listbox.getByRole('option', {
            name,
            exact: true
        });

        if (method === 'keyboard') {

            await this.page.keyboard.type(name);
            await expect(option).toBeVisible({ timeout: 15000 });
            await this.page.keyboard.press('Enter');

        } else {

            await expect(option).toBeVisible({ timeout: 15000 });
            await option.click();

        }

    }


    // Save Group
    async saveGroup(
        name,
        parent,
        method = 'keyboard',
        expectCreated = true
    ) {

        await (await this.nameField()).fill(name);

        if (parent) {

            await this.selectParent(
                parent,
                method
            );

        }

        const saveButton = this.page.getByRole('button', {
            name: 'Save',
            exact: true
        });
        await expect(saveButton).toBeVisible({ timeout: 15000 });
        await expect(saveButton).toBeEnabled({ timeout: 15000 });
        await saveButton.click();

        if (expectCreated) {
            await expect(this.page.getByRole('dialog')).toBeHidden({ timeout: 15000 });
            await expect(
                this.findGroupRow(name).locator('td').nth(1)
            ).toHaveText(
                this.groupNameMatcher(name),
                { timeout: 20000 }
            );
        }

    }


    // Edit Group
    async editGroup(
        oldName,
        newName,
        newParent,
        method = 'mouse'
    ) {

        const row = this.findGroupRow(oldName);

        await expect(row).toBeVisible();

        await row
            .locator('button, a')
            .first()
            .click();

        await expect(
            this.page.getByText('Edit Group', {
                exact: true
            })
        ).toBeVisible();


        await (await this.nameField()).fill(newName);

        await this.selectParent(
            newParent,
            method
        );

        await this.page
            .getByRole('button', {
                name: 'Save',
                exact: true
            })
            .click();

    }


    // Delete Group
    async deleteGroup(name) {

        const search = await this.searchBox();
        await search.fill(name);

        const row = this.findGroupRow(name);

        await expect(
            row.locator('td').nth(1)
        ).toHaveText(this.groupNameMatcher(name), { timeout: 20000 });

        await row
            .locator('button, a')
            .last()
            .click();


        // Verify confirmation
        await expect(
            this.page.getByText(
                /Are you sure you want to delete this Group/i
            )
        ).toBeVisible();


        // Confirm deletion
        await this.page
            .getByRole('button', {
                name: /^Ok$/i
            })
            .click();

        await expect(row).toHaveCount(0, { timeout: 20000 });

    }

}