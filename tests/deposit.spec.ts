import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

// Module: Deposit (TC-DEP-*)
// Each test reads the balance dynamically before acting, since these customer
// accounts are shared, mutable state on the live demo site (see playwright.config.ts: workers: 1
// keeps the whole suite sequential so this stays deterministic).
test.describe('Deposit', () => {
  // TC-DEP-001: a valid deposit increases the balance and shows a success message
  test('TC-DEP-001: valid deposit increases the balance', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.deposit(100);

    await expect(accountPage.depositSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance + 100);
  });

  // TC-DEP-002: an empty amount field is not processed
  test('TC-DEP-002: empty amount is not processed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('');

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-DEP-003: a deposit of 0 must be rejected or leave the balance unchanged
  test('TC-DEP-003: deposit of 0 leaves the balance unchanged', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('0');

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-DEP-004: a negative amount must be rejected; the balance must not decrease
  test('TC-DEP-004: negative deposit amount is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('-50');

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-DEP-005: verify the app's actual rule for decimal amounts (accepted, rounded, or rejected)
  test('TC-DEP-005: decimal deposit amount is rejected by the amount field', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('100.50');

    // Observed rule on the live app: the Amount field only accepts whole numbers,
    // so a decimal value fails HTML5 validation and no transaction is recorded.
    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-DEP-006: non-numeric characters must be rejected by the amount field
  test('TC-DEP-006: non-numeric amount is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.depositAmountInput.pressSequentially('abc');
    await expect(accountPage.depositAmountInput).toHaveValue('');
    await accountPage.depositSubmitButton.click();

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-DEP-007: a very large amount is handled without overflow and the balance is calculated correctly
  test('TC-DEP-007: very large deposit amount is calculated correctly', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();
    const largeAmount = 99999999999;

    await accountPage.deposit(largeAmount);

    await expect(accountPage.depositSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance + largeAmount);
  });
});
