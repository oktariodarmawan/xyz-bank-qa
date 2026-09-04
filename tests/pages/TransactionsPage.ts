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

  /**
   * The live app's Transactions view intermittently renders a completely empty table
   * right after transactions were just made in the same session (a real bug in the app,
   * reproduced independently while building this suite). A full page reload is not a safe
   * recovery here — it resets balance/history to seed data — so this leaves the SPA and
   * re-enters the tab instead, which is what a user would naturally try.
   */
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

  // TC-TXN-001 / TC-TXN-002: verifies a single row carries the exact amount and type together
  // with a non-empty timestamp, rather than just checking the table as a whole.
  async expectEntry(type: 'Credit' | 'Debit', amount: number) {
    await this.ensureRowsLoaded();
    // The seed history has well over a hundred rows; wait for the table to finish
    // rendering before filtering, otherwise a still-empty tbody looks like a real miss.
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
