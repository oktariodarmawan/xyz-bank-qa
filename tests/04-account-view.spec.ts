import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { AddCustomerPage } from './pages/AddCustomerPage.js';

test.describe('Account View', () => {
  test('TC-ACC-001: account information is fully displayed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    await expect(accountPage.accountNumberLabel).toBeVisible();
    // Some accounts render the account number with trailing whitespace in the binding itself.
    await expect(accountPage.accountNumberValue).toHaveText(/^\d+\s*$/);
    await expect(accountPage.balance).toHaveText(/^\d+(\.\d+)?$/);
    await expect(accountPage.currencyLabel).toBeVisible();
    await expect(accountPage.currencyValue).toHaveText(/Dollar|Pound|Rupee/);
  });

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
    await expect(accountPage.accountNumberValue).toHaveText('1003');
    await expect(accountPage.balance).toHaveText(/^\d+(\.\d+)?$/);
    await expect(accountPage.currencyValue).toHaveText(/Dollar|Pound|Rupee/);
  });

  test('TC-ACC-003: logout ends the customer session', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    const loggedOutPage = await accountPage.logout();

    await expect(page).toHaveURL(/#\/customer$/);
    await expect(loggedOutPage.userSelect).toBeVisible();
  });

  test('TC-ACC-004: a customer with no account shows an empty state', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueFirstName = `TCACC004_${Date.now()}`;
    // The "Your Name" dropdown shows "First Last" as one combined label.
    const fullName = `${uniqueFirstName} NoAccount`;
    await addCustomerPage.addCustomer(uniqueFirstName, 'NoAccount', '12345');

    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.goto();
    const optionLabels = await customerLoginPage.customerOptions.allTextContents();
    expect(optionLabels).toContain(fullName);

    const accountPage = await customerLoginPage.loginAsCustomer(fullName);
    await expect(accountPage.welcomeMessage(fullName)).toBeVisible();
    await expect(page.getByText('Please open an account with us.')).toBeVisible();
    await expect(accountPage.accountNumberLabel).toBeHidden();
  });

  test('TC-ACC-005: balance is unchanged after switching to another account and back', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Hermoine Granger');

    await accountPage.selectAccount('1001');
    const originalBalance = await accountPage.getBalance();

    await accountPage.selectAccount('1002');
    await expect(accountPage.accountSelect).toHaveValue('number:1002');

    await accountPage.selectAccount('1001');
    await expect(accountPage.accountSelect).toHaveValue('number:1001');
    expect(await accountPage.getBalance()).toBe(originalBalance);
  });
});
