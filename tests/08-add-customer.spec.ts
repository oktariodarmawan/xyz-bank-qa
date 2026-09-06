import { test, expect } from '@playwright/test';
import { AddCustomerPage } from './pages/AddCustomerPage.js';

test.describe('Add Customer', () => {
  test('TC-ADD-001: add a customer with valid data', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueName = `TCADD001_${Date.now()}`;

    const dialogMessage = await addCustomerPage.addCustomer(uniqueName, 'Doe', '12345');

    expect(dialogMessage).toMatch(/Customer added successfully with customer id\s*:\s*\d+/);
    const managerPage = await addCustomerPage.goToCustomersList();
    await managerPage.expectCustomerListed(uniqueName);
  });

  test('TC-ADD-002: all fields empty is not submitted', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();

    await expect(addCustomerPage.firstNameInput).toHaveJSProperty('validity.valid', false);
    await expect(addCustomerPage.lastNameInput).toHaveJSProperty('validity.valid', false);
    await expect(addCustomerPage.postCodeInput).toHaveJSProperty('validity.valid', false);

    let dialogSeen = false;
    page.once('dialog', () => { dialogSeen = true; });
    await addCustomerPage.submitButton.click();
    await page.waitForTimeout(300);

    expect(dialogSeen).toBe(false);
  });

  test('TC-ADD-003: missing Post Code is not submitted', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    await addCustomerPage.firstNameInput.fill('Jane');
    await addCustomerPage.lastNameInput.fill('Roe');

    await expect(addCustomerPage.postCodeInput).toHaveJSProperty('validity.valid', false);

    let dialogSeen = false;
    page.once('dialog', () => { dialogSeen = true; });
    await addCustomerPage.submitButton.click();
    await page.waitForTimeout(300);

    expect(dialogSeen).toBe(false);
  });

  // A duplicate is only rejected when first name, last name, AND post code all match.
  test('TC-ADD-004: an exact duplicate customer is rejected', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const firstName = `TCADD004_${Date.now()}`;

    const firstDialog = await addCustomerPage.addCustomer(firstName, 'Duplicate', '11111');
    expect(firstDialog).toContain('successfully');

    await addCustomerPage.goto();
    const secondDialog = await addCustomerPage.addCustomer(firstName, 'Duplicate', '11111');

    expect(secondDialog).toMatch(/duplicate/i);
    await addCustomerPage.goToCustomersList();
    await expect(page.locator('table tbody tr', { hasText: firstName })).toHaveCount(1);
  });

  test('TC-ADD-005: name with numbers and special characters is accepted', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueSuffix = Date.now();
    const firstName = `J0hn@#${uniqueSuffix}`;

    const dialogMessage = await addCustomerPage.addCustomer(firstName, 'D0e!', '12345');

    expect(dialogMessage).toContain('successfully');
    const managerPage = await addCustomerPage.goToCustomersList();
    await managerPage.expectCustomerListed(firstName);
  });

  test('TC-ADD-006: Post Code with letters is accepted', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueName = `TCADD006_${Date.now()}`;

    const dialogMessage = await addCustomerPage.addCustomer(uniqueName, 'Lee', 'ABCDE');

    expect(dialogMessage).toContain('successfully');
  });

  test('TC-ADD-007: a very long first name is handled without breaking the page', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const longName = 'a'.repeat(300);

    const dialogMessage = await addCustomerPage.addCustomer(longName, 'LongName', '12345');

    expect(dialogMessage).toMatch(/Customer added successfully with customer id\s*:\s*\d+/);
    await addCustomerPage.goToCustomersList();
    await expect(page.locator('table')).toBeVisible();
  });

  test('TC-ADD-008: leading/trailing spaces are trimmed from the name', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueLast = `Kim${Date.now()}`;

    await addCustomerPage.addCustomer('  Bob  ', `  ${uniqueLast}  `, '12345');

    await addCustomerPage.goToCustomersList();
    const row = page.locator('table tbody tr', { hasText: uniqueLast.trim() });
    await expect(row.locator('td').first()).toHaveText('Bob');
    await expect(row.locator('td').nth(1)).toHaveText(uniqueLast.trim());
  });
});
