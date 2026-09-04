import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

// Module: Withdrawl (TC-WD-*)
// Each test reads the balance dynamically before acting, since these customer
// accounts are shared, mutable state on the live demo site (see playwright.config.ts: workers: 1
// keeps the whole suite sequential so this stays deterministic).
test.describe('Withdrawl', () => {
  // TC-WD-001: a withdrawal within the balance succeeds and decreases the balance
  test('TC-WD-001: withdrawal within the balance succeeds', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    // This is shared, globally-mutable data on the live demo site, so top up first
    // to guarantee the "balance > withdrawal amount" precondition instead of assuming it.
    await accountPage.deposit(200);
    const startingBalance = await accountPage.getBalance();

    await accountPage.withdraw(50);

    await expect(accountPage.withdrawSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance - 50);
  });

  // TC-WD-002: a withdrawal above the balance fails and the balance is unchanged
  test('TC-WD-002: withdrawal exceeding the balance is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw(String(startingBalance + 1000));

    await expect(accountPage.withdrawFailureMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-WD-003: withdrawing exactly the full balance succeeds and leaves 0
  test('TC-WD-003: withdrawing the full balance leaves 0', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');

    // Deposit a known amount first so the "full balance" figure is controlled
    // and reproducible regardless of what earlier runs left behind.
    await accountPage.deposit(500);
    const fullBalance = await accountPage.getBalance();

    await accountPage.withdraw(fullBalance);

    await expect(accountPage.withdrawSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(0);
  });

  // TC-WD-004: withdrawing 1 unit above the balance is rejected and the balance remains
  test('TC-WD-004: withdrawal of balance + 1 is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw(String(startingBalance + 1));

    await expect(accountPage.withdrawFailureMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-WD-005: an empty amount field is not processed
  test('TC-WD-005: empty amount is not processed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw('');

    await expect(accountPage.withdrawSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-WD-006: a negative amount is rejected; the balance must not increase
  test('TC-WD-006: negative withdrawal amount is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw('-20');

    await expect(accountPage.withdrawSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-WD-007: any withdrawal from a 0 balance is rejected
  test('TC-WD-007: withdrawal from a 0 balance is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    // Drain the account to a known 0 balance first, deterministically.
    const startingBalance = await accountPage.getBalance();
    if (startingBalance > 0) {
      await accountPage.withdraw(startingBalance);
    }
    expect(await accountPage.getBalance()).toBe(0);

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw('10');

    await expect(accountPage.withdrawFailureMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(0);
  });
});
