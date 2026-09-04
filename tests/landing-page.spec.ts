import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

// Module: Landing Page (TC-LOGIN-*)
test.describe('Landing Page', () => {
  // TC-LOGIN-001: home page shows both login options plus the Home button
  test('TC-LOGIN-001: home page shows both login options', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(page).toHaveTitle('XYZ Bank');
    await expect(homePage.customerLoginButton).toBeVisible();
    await expect(homePage.managerLoginButton).toBeVisible();
    await expect(homePage.homeButton).toBeVisible();
  });

  // TC-LOGIN-002: Home button returns to the home page from any page after login
  test('TC-LOGIN-002: Home button returns to the home page', async ({ page }) => {
    const homePage = new HomePage(page);
    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.loginAsCustomer('Harry Potter');

    await homePage.goHome();

    await expect(page).toHaveURL(/#\/login$/);
    await expect(homePage.customerLoginButton).toBeVisible();
    await expect(homePage.managerLoginButton).toBeVisible();
  });
});
