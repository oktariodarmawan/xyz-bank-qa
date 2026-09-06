import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { ManagerPage } from './pages/ManagerPage.js';
import { AccountPage } from './pages/AccountPage.js';

test.describe('role navigation', () => {
  test('manager role navigation exposes manager controls and hides customer controls', async ({ page }) => {
    const homePage = new HomePage(page);
    const managerPage = new ManagerPage(page);

    await homePage.goto();
    await homePage.goToManagerLogin();
    await expect(page).toHaveURL(/#\/manager$/);

    await expect(managerPage.addCustomerNavButton).toBeVisible();
    await expect(managerPage.openAccountNavButton).toBeVisible();
    await expect(managerPage.customersNavButton).toBeVisible();

    const accountPage = new AccountPage(page);
    await expect(accountPage.accountSelect).toHaveCount(0);
    await expect(accountPage.depositButton).toHaveCount(0);
  });

  test('customer role navigation hides manager controls', async ({ page }) => {
    const homePage = new HomePage(page);
    const managerPage = new ManagerPage(page);

    await homePage.goto();
    await homePage.goToCustomerLogin();
    await expect(page).toHaveURL(/#\/customer$/);

    await expect(managerPage.addCustomerNavButton).toHaveCount(0);
    await expect(managerPage.openAccountNavButton).toHaveCount(0);
    await expect(managerPage.customersNavButton).toHaveCount(0);
  });

  test('customer login validation rejects an empty selection', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.goto();

    await expect(customerLoginPage.loginButton).toBeHidden();

    await customerLoginPage.selectCustomer('Hermoine Granger');
    await expect(customerLoginPage.loginButton).toBeVisible();
    const accountPage = await customerLoginPage.login();
    await expect(page).toHaveURL(/#\/account$/);
    await expect(accountPage.welcomeMessage('Hermoine Granger')).toBeVisible();
  });
});
