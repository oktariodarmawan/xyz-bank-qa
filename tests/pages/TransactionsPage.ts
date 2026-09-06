import { Page, Locator, expect } from '@playwright/test';

export class TransactionsPage {
  readonly page: Page;
  readonly rows: Locator;
  readonly backButton: Locator;
  readonly dateHeaderSort: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rows = page.locator('table tbody tr');
    this.backButton = page.getByRole('button', { name: 'Back' });
    this.dateHeaderSort = page.getByRole('link', { name: 'Date-Time' });
  }

  // The Transactions view can intermittently render empty right after transactions were
  // just made. A reload isn't a safe recovery (it resets balance/history), so retry by
  // leaving and re-entering the tab instead.
  private async ensureRowsLoaded() {
    for (let attempt = 0; attempt < 3; attempt++) {
      const appeared = await this.rows.first().waitFor({ state: 'visible', timeout: 4000 }).then(() => true).catch(() => false);
      if (appeared) return;
      await this.backButton.click();
      await expect(this.page).toHaveURL(/#\/account$/);
      await this.page.getByRole('button', { name: 'Transactions' }).click();
      await expect(this.page).toHaveURL(/#\/listTx$/);
    }
  }

  async back() {
    await this.backButton.click();
    await expect(this.page).toHaveURL(/#\/account$/);
  }

  async expectEntry(type: 'Credit' | 'Debit', amount: number) {
    await this.ensureRowsLoaded();
    await expect(this.rows.first()).toBeVisible();
    const row = this.rows.filter({ hasText: type }).filter({ hasText: String(amount) }).last();
    await expect(row).toBeVisible();
    await expect(row.locator('td').nth(1)).toHaveText(String(amount));
    await expect(row.locator('td').nth(2)).toHaveText(type);
    await expect(row.locator('td').nth(0)).not.toBeEmpty();
  }

  async rowCount(): Promise<number> {
    await this.ensureRowsLoaded();
    await expect(this.rows.first()).toBeVisible();
    return this.rows.count();
  }

  async allRowsText(): Promise<string[][]> {
    await this.ensureRowsLoaded();
    await expect(this.rows.first()).toBeVisible();
    return this.rows.evaluateAll(trs =>
      trs.map(tr => Array.from(tr.querySelectorAll('td')).map(td => (td.textContent ?? '').trim()))
    );
  }
}
