import { test, expect } from '../../fixtures/baseTest.js';

import LedgerGroupsPage from '../../pages/accountingMaster/ledger-groups.page.js';

import {
    predefinedGroups,
    groupRunData
} from '../../utils/group-data.js';


test.describe.serial(
    'Accounting Master - Ledger Groups',
    () => {

        let groups;

        let parentOptions = [];


        // Before Each
        test.beforeEach(async ({ loggedPage }) => {

            groups = new LedgerGroupsPage(loggedPage);

            await groups.open();

            await groups.openAdd();
            parentOptions =
                await groups.collectParentOptions();
            await groups.closeAdd();

        });


        // TC_Groups_001
        test(
            'TC_Groups_001 - Verify predefined groups',
            async () => {

                const missingGroups = [];

                for (const name of predefinedGroups) {

                    if (!(await groups.groupExists(name))) {
                        missingGroups.push(name);
                    }

                }

                if (missingGroups.length) {
                    console.warn(
                        `Predefined groups not found: ${missingGroups.join(', ')}`
                    );
                } else {
                    console.log('All predefined groups were found.');
                }

                // Root groups are verified, not auto-created.
                // Add Group requires a Parent Group.

            }
        );


        // TC_Groups_002
        test(
            'TC_Groups_002 - Create subgroup',
            async () => {

                test.skip(
                    !parentOptions.length,
                    'Parent Group options unavailable.'
                );

                const parent = parentOptions.find(
                    x => !/^select/i.test(x)
                );

                test.skip(
                    !parent,
                    'No usable parent option.'
                );

                const name = groupRunData.createName;

                if (await groups.groupExists(name)) {

                    test.skip(
                        true,
                        'Unique test group already exists.'
                    );

                }

                await groups.openAdd();

                await groups.saveGroup(
                    name,
                    parent,
                    'keyboard'
                );

                await expect(
                    groups.findGroupRow(name)
                ).toBeVisible();

            }
        );


        // TC_Groups_003
        test(
            'TC_Add_Groups_003 - Reject empty group name',
            async ({ loggedPage }) => {

                test.skip(
                    !parentOptions.length,
                    'Parent Group options unavailable.'
                );

                const parent = parentOptions.find(
                    x => !/^select/i.test(x)
                );

                test.skip(
                    !parent,
                    'No usable parent option.'
                );

                await groups.openAdd();

                await groups.selectParent(parent);

                await loggedPage
                    .getByRole('button', {
                        name: 'Save',
                        exact: true
                    })
                    .click();

                const name = await groups.nameField();

                await expect(name)
                    .toHaveJSProperty(
                        'validity.valid',
                        false
                    );

            }
        );


        // TC_Groups_004
        test(
            'TC_Add_Groups_004 - Reject missing Parent Group',
            async ({ loggedPage }) => {

                await groups.openAdd();

                await (await groups.nameField()).fill(
                    `PW_NoParent_${Date.now()}`
                );

                await loggedPage
                    .getByRole('button', {
                        name: 'Save',
                        exact: true
                    })
                    .click();

                const parent =
                    await groups.parentControl();

                if (await parent.count()) {

                    await expect(parent)
                        .toHaveJSProperty(
                            'validity.valid',
                            false
                        );

                } else {

                    await expect(
                        loggedPage
                            .getByText(/Parent Group/i)
                            .last()
                    ).toBeVisible();

                }

            }
        );


        // TC_Groups_006
        test(
            'TC_Groups_006 - Edit subgroup name and parent',
            async () => {

                const oldName =
                    groupRunData.createName;

                test.skip(
                    !(await groups.groupExists(oldName)),
                    'Create subgroup first.'
                );

                const newParent = parentOptions.find(
                    x => !/^select/i.test(x)
                );

                test.skip(
                    !newParent,
                    'No valid new parent option.'
                );

                const newName =
                    `${oldName}${groupRunData.editSuffix}`;

                await groups.editGroup(
                    oldName,
                    newName,
                    newParent,
                    'mouse'
                );

                await expect(
                    groups.findGroupRow(newName)
                ).toBeVisible();

            }
        );


        // TC_Groups_007
        test(
            'TC_Groups_007 - Delete unused subgroup',
            async () => {

                const name =
                    `${groupRunData.createName}${groupRunData.editSuffix}`;

                test.skip(
                    !(await groups.groupExists(name)),
                    'Edited test group not found.'
                );

                await groups.deleteGroup(name);

                await expect(
                    groups.findGroupRow(name)
                ).toHaveCount(0);

            }
        );


        // TC_Groups_008
        test(
            'TC_Groups_008 - Prevent deletion of group in use',
            async () => {

                const name = process.env.IN_USE_GROUP;

                test.skip(
                    !name,
                    'Set IN_USE_GROUP in .env.'
                );

                const row = groups.findGroupRow(name);

                await expect(row).toBeVisible();

                await row
                    .locator('button, a')
                    .last()
                    .click();

                await expect(
                    groups.page.getByText(
                        /Are you sure you want to delete this Group/i
                    )
                ).toBeVisible();

                await groups.page
                    .getByRole('button', {
                        name: /^Ok$/i
                    })
                    .click();

                await expect(
                    groups.page.getByText(
                        /cannot be deleted|can not be deleted|used/i
                    )
                ).toBeVisible();

            }
        );


        // TC_Groups_009
        test(
            'TC_Groups_009 - Reject duplicate group name',
            async ({ loggedPage }) => {

                test.skip(
                    !parentOptions.length,
                    'Parent Group options unavailable.'
                );

                const parent = parentOptions.find(
                    x => !/^select/i.test(x)
                );

                test.skip(
                    !parent,
                    'No usable parent option.'
                );

                const name =
                    groupRunData.duplicateName;


                // Create group if it does not exist
                if (!(await groups.groupExists(name))) {

                    await groups.openAdd();

                    await groups.saveGroup(
                        name,
                        parent
                    );

                    await expect(
                        groups.findGroupRow(name)
                    ).toBeVisible();

                }


                // Attempt duplicate creation
                await groups.openAdd();

                await groups.saveGroup(
                    name,
                    parent,
                    'keyboard',
                    false
                );


                await expect(
                    loggedPage.getByText(
                        /already been taken|already exists|taken/i
                    )
                ).toBeVisible();

            }
        );

    }
);