import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { AddCustomerPage } from './pages/AddCustomerPage.js';

test.describe('cross-browser smoke', () => {
  test('homepage role choices are usable', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectLoaded();
  });

  test('customer login validation rejects an empty selection', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.goto();
    await expect(customerLoginPage.loginButton).toBeHidden();

    await customerLoginPage.selectCustomer('Hermoine Granger');
    const accountPage = await customerLoginPage.login();
    await expect(accountPage.welcomeMessage('Hermoine Granger')).toBeVisible();
  });

  test('valid deposit increases the balance', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.deposit(25);
    expect(await accountPage.getBalance()).toBe(startingBalance + 25);
  });

  test('valid withdrawal decreases the balance', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    await accountPage.deposit(50);
    const balanceAfterDeposit = await accountPage.getBalance();

    await accountPage.withdraw(20);
    expect(await accountPage.getBalance()).toBe(balanceAfterDeposit - 20);
  });

  test('manager can add a customer', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueName = `CrossBrowser${Date.now()}`;

    const dialogMessage = await addCustomerPage.addCustomer(uniqueName, 'Automation', '90210');
    expect(dialogMessage).toContain('Customer added successfully');

    await addCustomerPage.goToCustomersList();
    await expect(page.getByText(uniqueName)).toBeVisible();
  });
});
