import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

test.describe('Withdrawl', () => {
  test('TC-WD-001: withdrawal within the balance succeeds', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    await accountPage.deposit(200);
    const startingBalance = await accountPage.getBalance();

    await accountPage.withdraw(50);

    await expect(accountPage.withdrawSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance - 50);
  });

  test('TC-WD-002: withdrawal exceeding the balance is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw(String(startingBalance + 1000));

    await expect(accountPage.withdrawFailureMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-WD-003: withdrawing the full balance leaves 0', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');

    await accountPage.deposit(500);
    const fullBalance = await accountPage.getBalance();

    await accountPage.withdraw(fullBalance);

    await expect(accountPage.withdrawSuccessMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(0);
  });

  test('TC-WD-004: withdrawal of balance + 1 is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw(String(startingBalance + 1));

    await expect(accountPage.withdrawFailureMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-WD-005: empty amount is not processed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw('');

    await expect(accountPage.withdrawSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-WD-006: negative withdrawal amount is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw('-20');

    await expect(accountPage.withdrawSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-WD-007: withdrawal from a 0 balance is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

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

  test('TC-WD-008: non-numeric amount is rejected', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.withdrawAmountInput.pressSequentially('xyz');
    await expect(accountPage.withdrawAmountInput).toHaveValue('');
    await accountPage.withdrawSubmitButton.click();

    await expect(accountPage.withdrawSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  test('TC-WD-009: withdrawal of 0 is not processed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw('0');

    await expect(accountPage.withdrawSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });
});
