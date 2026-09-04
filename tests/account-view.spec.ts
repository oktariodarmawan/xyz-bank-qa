import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

// Module: Account View (TC-ACC-*)
test.describe('Account View', () => {
  // TC-ACC-001: account information panel shows Account Number, Balance, and Currency
  test('TC-ACC-001: account information is fully displayed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    await expect(accountPage.accountNumberLabel).toBeVisible();
    // Some accounts on the live app render the account number with trailing whitespace
    // in the binding itself (observed on Harry Potter's default account) — tolerate it.
    await expect(accountPage.accountNumberValue).toHaveText(/^\d+\s*$/);
    await expect(accountPage.balance).toHaveText(/^\d+(\.\d+)?$/);
    await expect(accountPage.currencyLabel).toBeVisible();
    await expect(accountPage.currencyValue).toHaveText(/Dollar|Pound|Rupee/);
  });

  // TC-ACC-002: switching account via the dropdown updates account number, balance, and currency together
  test('TC-ACC-002: switching account via dropdown updates the balance', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Hermoine Granger');

    await accountPage.selectAccount('1002');
    await expect(accountPage.accountSelect).toHaveValue('number:1002');
    await expect(accountPage.accountNumberValue).toHaveText('1002');
    await expect(accountPage.balance).toHaveText(/^\d+(\.\d+)?$/);
    await expect(accountPage.currencyValue).toHaveText(/Dollar|Pound|Rupee/);

    await accountPage.selectAccount('1003');
    await expect(accountPage.accountSelect).toHaveValue('number:1003');
    // Asserting the account number itself changed (not just balance/currency) is what
    // actually catches a stale-value bug — a leftover 1002 here would fail this line.
    await expect(accountPage.accountNumberValue).toHaveText('1003');
    await expect(accountPage.balance).toHaveText(/^\d+(\.\d+)?$/);
    await expect(accountPage.currencyValue).toHaveText(/Dollar|Pound|Rupee/);
  });

  // TC-ACC-003: Logout ends the customer session and returns to the Customer Login page
  test('TC-ACC-003: logout ends the customer session', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    const loggedOutPage = await accountPage.logout();

    await expect(page).toHaveURL(/#\/customer$/);
    await expect(loggedOutPage.userSelect).toBeVisible();
  });
});
