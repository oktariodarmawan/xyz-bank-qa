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
    // Angular bootstrap can outlast goto()'s load event; reload once if #userSelect isn't up yet.
    const appeared = await this.userSelect.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (!appeared) {
      await this.page.reload();
      await expect(this.userSelect).toBeVisible({ timeout: 15000 });
    }
  }

  async selectCustomer(customer: string) {
    await this.userSelect.selectOption({ label: customer });
    // selectOption occasionally doesn't stick (select stays on the blank default); retry once.
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
