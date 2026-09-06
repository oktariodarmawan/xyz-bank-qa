import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

test.describe('Deposit', () => {
  test('TC-DEP-001: valid deposit increases the balance', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.deposit(100);

    await expect(accountPage.depositSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance + 100);
  });

  test('TC-DEP-002: empty amount is not processed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('');

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-DEP-003: deposit of 0 leaves the balance unchanged', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('0');

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-DEP-004: negative deposit amount is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('-50');

    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-DEP-005: decimal deposit amount is rejected by the amount field', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('100.50');

    // The Amount field only accepts whole numbers.
    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

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

  test('TC-DEP-007: very large deposit amount is calculated correctly', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();
    const largeAmount = 99999999999;

    await accountPage.deposit(largeAmount);

    await expect(accountPage.depositSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance + largeAmount);
  });

  test('TC-DEP-008: multiple consecutive deposits accumulate', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    const startingBalance = await accountPage.getBalance();

    await accountPage.deposit(100);
    await accountPage.deposit(50);
    await accountPage.deposit(25);

    expect(await accountPage.getBalance()).toBe(startingBalance + 175);
  });
});
