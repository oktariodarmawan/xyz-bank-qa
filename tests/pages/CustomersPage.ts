import { Page, Locator, expect } from '@playwright/test';

export class CustomersPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly rows: Locator;
  readonly firstNameHeader: Locator;
  readonly lastNameHeader: Locator;
  readonly postCodeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder="Search Customer"]');
    this.rows = page.locator('table tbody tr');
    this.firstNameHeader = page.getByRole('link', { name: 'First Name' });
    this.lastNameHeader = page.getByRole('link', { name: 'Last Name' });
    this.postCodeHeader = page.getByRole('link', { name: 'Post Code' });
  }

  async goto() {
    await this.page.goto('#/manager/list');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
  }

  rowFor(name: string): Locator {
    return this.rows.filter({ hasText: name });
  }

  async firstNameColumnValues(): Promise<string[]> {
    return this.rows.evaluateAll(trs => trs.map(tr => tr.querySelector('td')?.textContent?.trim() ?? ''));
  }

  async deleteCustomer(name: string) {
    await this.rowFor(name).getByRole('button', { name: 'Delete' }).click();
  }

  async expectCustomerVisible(name: string) {
    await expect(this.rowFor(name)).toBeVisible();
  }

  async expectCustomerHidden(name: string) {
    await expect(this.rowFor(name)).toHaveCount(0);
  }
}
