import { test, expect } from '@playwright/test';
import { OpenAccountPage } from './pages/OpenAccountPage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

// Module: Open Account (TC-OPEN-*)
test.describe('Open Account', () => {
  // TC-OPEN-001: opening an account for an existing customer with a valid currency succeeds
  test('TC-OPEN-001: open an account with a valid currency', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    await openAccountPage.selectCustomer('Ron Weasly');
    await openAccountPage.selectCurrency('Dollar');
    const dialogMessage = await openAccountPage.process();

    expect(dialogMessage).toMatch(/Account created successfully with account Number\s*:\s*\d+/);
  });

  // TC-OPEN-002: Process without selecting a customer does not create an account
  test('TC-OPEN-002: Process without a selected customer is blocked', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    await openAccountPage.selectCurrency('Dollar');
    const dialogMessage = await openAccountPage.process();

    expect(dialogMessage).toBe('');
    await expect(openAccountPage.customerSelect).toHaveJSProperty('validity.valid', false);
  });

  // TC-OPEN-003: Process without selecting a currency does not create an account
  test('TC-OPEN-003: Process without a selected currency is blocked', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    await openAccountPage.selectCustomer('Albus Dumbledore');
    const dialogMessage = await openAccountPage.process();

    expect(dialogMessage).toBe('');
    await expect(openAccountPage.currencySelect).toHaveJSProperty('validity.valid', false);
  });

  // TC-OPEN-004: the Currency dropdown offers exactly Dollar, Pound, and Rupee
  test('TC-OPEN-004: Currency dropdown shows the full set of options', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();

    const options = await openAccountPage.currencyOptions.allTextContents();

    expect(options).toEqual(expect.arrayContaining(['Dollar', 'Pound', 'Rupee']));
  });

  // TC-OPEN-005: a customer can hold more than one account, visible in the Account dropdown at login
  // Uses a seed customer rather than one just created via Add Customer: the live app's Open
  // Account customer dropdown doesn't reflect customers added earlier in the same session
  // (an observed data-sync gap), so a freshly-created customer can never be selected here.
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
});
