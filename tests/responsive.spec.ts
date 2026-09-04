import { test, expect, Page } from '@playwright/test';
import { HomePage } from './pages/HomePage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { AddCustomerPage } from './pages/AddCustomerPage.js';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
}

// TC-017
for (const viewport of VIEWPORTS) {
  test.describe(`responsive layout at ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('role selection, customer login, deposit, and manager form remain usable without overflow', async ({ page }) => {
      const homePage = new HomePage(page);
      const customerLoginPage = new CustomerLoginPage(page);

      await homePage.goto();
      await homePage.expectLoaded();
      expect(await hasHorizontalOverflow(page)).toBe(false);

      await homePage.goToCustomerLogin();
      await customerLoginPage.selectCustomer('Hermoine Granger');
      const accountPage = await customerLoginPage.login();
      expect(await hasHorizontalOverflow(page)).toBe(false);

      await accountPage.deposit(10);
      await expect(accountPage.depositSuccessMessage).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);

      const addCustomerPage = new AddCustomerPage(page);
      await addCustomerPage.goto();
      await expect(addCustomerPage.firstNameInput).toBeVisible();
      await expect(addCustomerPage.submitButton).toBeVisible();
      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  });
}
