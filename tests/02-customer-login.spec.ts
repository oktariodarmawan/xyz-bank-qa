import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

test.describe('Customer Login', () => {
  test('TC-CLOGIN-001: Your Name dropdown lists the available customers', async ({ page }) => {
    const homePage = new HomePage(page);
    const customerLoginPage = new CustomerLoginPage(page);

    await homePage.goto();
    await homePage.goToCustomerLogin();

    const optionLabels = await customerLoginPage.customerOptions.allTextContents();
    expect(optionLabels.length).toBeGreaterThan(1);
    expect(optionLabels).toEqual(expect.arrayContaining(['Harry Potter', 'Hermoine Granger']));
  });

  test('TC-CLOGIN-002: logs in with a valid customer and shows the account page', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');

    await expect(page).toHaveURL(/#\/account$/);
    await expect(accountPage.welcomeMessage('Harry Potter')).toBeVisible();
    await expect(accountPage.accountNumberLabel).toBeVisible();
    await expect(accountPage.currencyLabel).toBeVisible();
    await expect(accountPage.balance).toHaveText(/\d+/);
  });

  test('TC-CLOGIN-003: Login without a selected customer does not proceed', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.goto();

    // The Login button only renders once a customer is selected.
    await expect(customerLoginPage.loginButton).toBeHidden();
    await expect(page).toHaveURL(/#\/customer$/);
  });

  test('TC-CLOGIN-004: customer with multiple accounts lists all accounts', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Hermoine Granger');

    const accountNumbers = await accountPage.accountSelect.locator('option').allTextContents();
    expect(accountNumbers.length).toBeGreaterThan(1);
    expect(accountNumbers).toEqual(expect.arrayContaining(['1001', '1002', '1003']));
  });
});
