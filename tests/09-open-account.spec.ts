import { test, expect } from '@playwright/test';
import { OpenAccountPage } from './pages/OpenAccountPage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

test.describe('Open Account', () => {
  test('TC-OPEN-001: open an account with a valid currency', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    await openAccountPage.selectCustomer('Ron Weasly');
    await openAccountPage.selectCurrency('Dollar');
    const dialogMessage = await openAccountPage.process();

    expect(dialogMessage).toMatch(/Account created successfully with account Number\s*:\s*\d+/);
  });

  test('TC-OPEN-002: Process without a selected customer is blocked', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    await openAccountPage.selectCurrency('Dollar');
    const dialogMessage = await openAccountPage.process();

    expect(dialogMessage).toBe('');
    await expect(openAccountPage.customerSelect).toHaveJSProperty('validity.valid', false);
  });

  test('TC-OPEN-003: Process without a selected currency is blocked', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    await openAccountPage.selectCustomer('Albus Dumbledore');
    const dialogMessage = await openAccountPage.process();

    expect(dialogMessage).toBe('');
    await expect(openAccountPage.currencySelect).toHaveJSProperty('validity.valid', false);
  });

  test('TC-OPEN-004: Currency dropdown shows the full set of options', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    const options = await openAccountPage.currencyOptions.allTextContents();

    expect(options).toEqual(expect.arrayContaining(['Dollar', 'Pound', 'Rupee']));
  });

  // Uses a seed customer: the Open Account customer dropdown doesn't reflect customers
  // added earlier in the same session, so a freshly-created customer isn't selectable here.
  test('TC-OPEN-005: a customer can have multiple accounts of the same currency', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const initialAccountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    const accountsBefore = await initialAccountPage.accountSelect.locator('option').count();

    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();
    await openAccountPage.selectCustomer('Neville Longbottom');
    await openAccountPage.selectCurrency('Dollar');
    const dialogMessage = await openAccountPage.process();
    expect(dialogMessage).toMatch(/Account created successfully/);

    await customerLoginPage.goto();
    const accountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    const accountsAfter = await accountPage.accountSelect.locator('option').count();

    expect(accountsAfter).toBe(accountsBefore + 1);
  });

  test('TC-OPEN-006: a customer can have accounts in different currencies', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const initialAccountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const accountsBefore = await initialAccountPage.accountSelect.locator('option').count();

    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();
    await openAccountPage.selectCustomer('Albus Dumbledore');
    await openAccountPage.selectCurrency('Rupee');
    const dialogMessage = await openAccountPage.process();
    expect(dialogMessage).toMatch(/Account created successfully/);

    await customerLoginPage.goto();
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const optionCount = await accountPage.accountSelect.locator('option').count();
    expect(optionCount).toBe(accountsBefore + 1);

    const currencies = new Set<string>();
    for (let i = 0; i < optionCount; i++) {
      await accountPage.accountSelect.selectOption({ index: i });
      currencies.add((await accountPage.currencyValue.textContent()) ?? '');
    }
    expect(currencies.size).toBeGreaterThan(1);
  });
});
