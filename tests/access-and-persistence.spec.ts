import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { ManagerPage } from './pages/ManagerPage.js';
import { AccountPage } from './pages/AccountPage.js';

test.describe('data persistence', () => {
  // TC-014
  // KNOWN FAILURE: a full page refresh keeps the logged-in customer's route/identity
  // but resets balance and transaction history to the seed data, instead of preserving
  // them as TEST-PLAN.md expects. This test documents the gap.
  test('customer data persists after a page refresh', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    await accountPage.selectAccount('1014');
    await accountPage.deposit(60);
    const balanceBeforeRefresh = await accountPage.getBalance();

    await page.reload();
    await expect(accountPage.welcomeMessage('Neville Longbottom')).toBeVisible();
    await expect(accountPage.accountSelect).toHaveValue('number:1014');
    expect(await accountPage.getBalance()).toBe(balanceBeforeRefresh);

    const transactionsPage = await accountPage.goToTransactions();
    await transactionsPage.expectEntry('Credit', 60);
  });

  // TC-015
  test('customer data persists after logout and login', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    await accountPage.selectAccount('1013');
    await accountPage.deposit(45);
    const balanceBeforeLogout = await accountPage.getBalance();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/#\/customer$/);

    const reLoggedInAccountPage = await customerLoginPage.loginAsCustomer('Neville Longbottom');
    await reLoggedInAccountPage.selectAccount('1013');
    expect(await reLoggedInAccountPage.getBalance()).toBe(balanceBeforeLogout);

    const transactionsPage = await reLoggedInAccountPage.goToTransactions();
    await transactionsPage.expectEntry('Credit', 45);
  });
});

test.describe('unauthorized feature access', () => {
  // TC-016
  // KNOWN FAILURE: the app has no client-side route guard, so a customer session
  // navigating directly to the manager route still sees the manager controls
  // (Add Customer / Open Account / Customers) instead of having them hidden.
  test('customer session cannot reach manager controls by direct navigation', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.loginAsCustomer('Hermoine Granger');

    const managerPage = new ManagerPage(page);
    await managerPage.goto();

    await expect(managerPage.addCustomerNavButton).toBeHidden();
    await expect(managerPage.openAccountNavButton).toBeHidden();
    await expect(managerPage.customersNavButton).toBeHidden();
  });

  test('manager session cannot see another customer\'s private account data by direct navigation', async ({ page }) => {
    const managerPage = new ManagerPage(page);
    await managerPage.goto();

    const accountPage = new AccountPage(page);
    await page.goto('#/account');

    // No customer is bound in a manager session, so no real account number or balance should render.
    await expect(accountPage.accountNumberValue).not.toHaveText(/^\d+$/);
    await expect(accountPage.balance).not.toHaveText(/^\d+$/);
  });
});
