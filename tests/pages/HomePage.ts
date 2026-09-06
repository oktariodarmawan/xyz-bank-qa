import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly customerLoginButton: Locator;
  readonly managerLoginButton: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.customerLoginButton = page.getByRole('button', { name: 'Customer Login' });
    this.managerLoginButton = page.getByRole('button', { name: 'Bank Manager Login' });
    this.homeButton = page.getByRole('button', { name: 'Home' });
  }

  async goto() {
    await this.page.goto('#/login');
    // The live app's Angular bootstrap can outlast the `load` event goto() waits for,
    // so the login buttons aren't always rendered yet; reload once before giving up.
    const appeared = await this.customerLoginButton.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (!appeared) {
      await this.page.reload();
      await expect(this.customerLoginButton).toBeVisible({ timeout: 15000 });
    }
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle('XYZ Bank');
    await expect(this.customerLoginButton).toBeVisible();
    await expect(this.managerLoginButton).toBeVisible();
    await expect(this.homeButton).toBeVisible();
  }

  /** The Home button sits in the top bar on every page, not just this one. */
  async goHome() {
    await this.homeButton.click();
    await expect(this.page).toHaveURL(/#\/login$/);
  }

  async goToCustomerLogin() {
    await this.customerLoginButton.click();
    await expect(this.page).toHaveURL(/#\/customer$/);
  }

  async goToManagerLogin() {
    await this.managerLoginButton.click();
  }
}
