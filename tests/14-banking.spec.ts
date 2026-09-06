import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { ManagerPage } from './pages/ManagerPage.js';
import { AddCustomerPage } from './pages/AddCustomerPage.js';

test.describe('customer banking flows', () => {
  test('customer can select a role, view accounts, and switch account', async ({ page }) => {
    const homePage = new HomePage(page);
    const customerLoginPage = new CustomerLoginPage(page);

    await homePage.goto();
    await homePage.expectLoaded();
    await homePage.goToCustomerLogin();

    await customerLoginPage.selectCustomer('Hermoine Granger');
    const accountPage = await customerLoginPage.login();

    await expect(accountPage.welcomeMessage('Hermoine Granger')).toBeVisible();
    await expect(accountPage.accountSelect).toHaveValue('number:1001');
    await expect(accountPage.accountNumberLabel).toBeVisible();
    await expect(accountPage.currencyLabel).toBeVisible();
    await expect(accountPage.balance).toHaveText(/\d+/);

    await accountPage.selectAccount('1002');
    await expect(accountPage.accountSelect).toHaveValue('number:1002');
    await expect(accountPage.accountNumberValue).toHaveText('1002');

    await accountPage.selectAccount('1003');
    await expect(accountPage.accountSelect).toHaveValue('number:1003');
    await expect(accountPage.accountNumberValue).toHaveText('1003');
  });

  test.describe('deposit, withdraw, and review transaction history', () => {
    // Extra retries locally too: shares the TC-TXN-002 live-app flake risk (see 07-transactions.spec.ts).
    test.describe.configure({ retries: 2 });

    test('customer can deposit, withdraw, and review transaction history', async ({ page }) => {
      const customerLoginPage = new CustomerLoginPage(page);
      const accountPage = await customerLoginPage.loginAsCustomer('Hermoine Granger');

      const startingBalance = await accountPage.getBalance();
      const depositAmount = 100;
      const withdrawalAmount = 40;

      await accountPage.deposit(depositAmount);
      await expect(accountPage.balance).toHaveText(String(startingBalance + depositAmount));

      await accountPage.withdraw(withdrawalAmount);
      await expect(accountPage.balance).toHaveText(String(startingBalance + depositAmount - withdrawalAmount));

      const transactionsPage = await accountPage.goToTransactions();
      await transactionsPage.expectEntry('Credit', depositAmount);
      await transactionsPage.expectEntry('Debit', withdrawalAmount);
    });
  });

  test('manager can add a customer and return to the manager area', async ({ page }) => {
    const managerPage = new ManagerPage(page);
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    await expect(addCustomerPage.submitButton).toBeVisible();
    const uniqueName = `Playwright${Date.now()}`;

    const dialogMessage = await addCustomerPage.addCustomer(uniqueName, 'Automation', '90210');
    expect(dialogMessage).toContain('Customer added successfully');

    await addCustomerPage.goToCustomersList();
    await managerPage.expectCustomerListed(uniqueName);
  });
});
