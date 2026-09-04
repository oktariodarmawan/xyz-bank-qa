import { Page, Locator, expect } from '@playwright/test';
import { AccountPage } from './AccountPage.js';

export class CustomerLoginPage {
  readonly page: Page;
  readonly userSelect: Locator;
  readonly customerOptions: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userSelect = page.locator('#userSelect');
    this.customerOptions = page.locator('#userSelect option');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('#/customer');
  }

  async selectCustomer(customer: string) {
    await expect(this.userSelect).toBeVisible();
    await this.userSelect.selectOption({ label: customer });
    // Occasionally observed on the live app: selectOption resolves but the Angular model
    // doesn't pick it up (the select silently stays on the blank default), which then leaves
    // the Login button permanently hidden. Retry once if the Login button hasn't appeared.
    const loggedIn = await this.loginButton.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
    if (!loggedIn) {
      await this.userSelect.selectOption({ label: customer });
    }
  }

  async login(): Promise<AccountPage> {
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/#\/account$/);
    return new AccountPage(this.page);
  }

  async loginAsCustomer(customer: string): Promise<AccountPage> {
    await this.goto();
    await this.selectCustomer(customer);
    return this.login();
  }
}
