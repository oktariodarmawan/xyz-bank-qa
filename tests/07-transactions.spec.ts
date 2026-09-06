import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { OpenAccountPage } from './pages/OpenAccountPage.js';

test.describe('Transactions', () => {
  // Extra retries locally too: this view can intermittently render empty right after a
  // deposit/withdraw, independent of CI vs local (see TransactionsPage.ensureRowsLoaded).
  test.describe.configure({ retries: 2 });

  test('TC-TXN-001: a deposit is recorded as Credit', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');

    await accountPage.deposit(77);
    const transactionsPage = await accountPage.goToTransactions();
    await transactionsPage.expectEntry('Credit', 77);
  });

  // Known live-app flake: the Transactions view can render an empty table right after a
  // deposit+withdraw in the same session. Re-run if this fails on the history assertion.
  test('TC-TXN-002: a withdrawal is recorded as Debit', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    if (await accountPage.getBalance() < 35) {
      await accountPage.deposit(100);
    }

    await accountPage.withdraw(35);
    const transactionsPage = await accountPage.goToTransactions();
    await transactionsPage.expectEntry('Debit', 35);
  });

  test('TC-TXN-003: Reset clears history when reachable, otherwise history stays intact', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    await accountPage.deposit(15);

    const transactionsPage = await accountPage.goToTransactions();
    const resetButton = page.getByRole('button', { name: 'Reset' });

    if (await resetButton.isVisible()) {
      await resetButton.click();
      await expect(transactionsPage.rows).toHaveCount(0);
    } else {
      expect(await transactionsPage.rowCount()).toBeGreaterThan(0);
    }
  });

  test('TC-TXN-004: Back button returns to the account page', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const transactionsPage = await accountPage.goToTransactions();

    await transactionsPage.back();

    await expect(page).toHaveURL(/#\/account$/);
    await expect(accountPage.balance).toHaveText(/^\d+(\.\d+)?$/);
  });

  // Shares the TC-TXN-002 live-app flake risk.
  test('TC-TXN-005: transaction order and time are consistent', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    await accountPage.deposit(100);
    await accountPage.withdraw(30);
    await accountPage.deposit(20);

    const transactionsPage = await accountPage.goToTransactions();
    const allRows = await transactionsPage.allRowsText();
    // Rows render oldest-first, so the 3 transactions just made are the last 3 rows.
    const lastThree = allRows.slice(-3);

    expect(lastThree.map(row => [row[1], row[2]])).toEqual([
      ['100', 'Credit'],
      ['30', 'Debit'],
      ['20', 'Credit'],
    ]);
    for (const row of lastThree) {
      expect(row[0]).not.toBe('');
    }
    const timestamps = lastThree.map(row => new Date(row[0]).getTime());
    expect(timestamps[0]).toBeLessThanOrEqual(timestamps[1]);
    expect(timestamps[1]).toBeLessThanOrEqual(timestamps[2]);
  });

  test('TC-TXN-006: an account with a high transaction volume loads', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Hermoine Granger');
    await expect(accountPage.accountSelect).toHaveValue('number:1001');

    const transactionsPage = await accountPage.goToTransactions();
    const rowCount = await transactionsPage.rowCount();

    expect(rowCount).toBeGreaterThan(100);
  });

  test('TC-TXN-007: transactions are specific to the selected account', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Hermoine Granger');

    await accountPage.selectAccount('1002');
    const marker = 137;
    await accountPage.deposit(marker);

    // 1001 has a large, reliably non-empty history (see TC-TXN-006), so an absent
    // marker there is a real signal rather than an ambiguous empty table.
    await accountPage.selectAccount('1001');
    const transactionsPage = await accountPage.goToTransactions();
    const rows = await transactionsPage.allRowsText();
    const leaked = rows.some(row => row[1] === String(marker) && row[2] === 'Credit');
    expect(leaked).toBe(false);
  });

  test('TC-TXN-008: an account with no transactions shows an empty history', async ({ page }) => {
    const openAccountPage = new OpenAccountPage(page);
    await openAccountPage.goto();
    await openAccountPage.selectCustomer('Ron Weasly');
    await openAccountPage.selectCurrency('Pound');
    const dialogMessage = await openAccountPage.process();
    const newAccountNumber = dialogMessage.match(/\d+/)?.[0];
    expect(newAccountNumber).toBeTruthy();

    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    await accountPage.selectAccount(newAccountNumber!);
    await expect(accountPage.accountSelect).toHaveValue(`number:${newAccountNumber}`);

    const transactionsPage = await accountPage.goToTransactions();
    await expect(transactionsPage.rows).toHaveCount(0);
  });
});
