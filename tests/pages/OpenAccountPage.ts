import { Page, Locator, expect } from '@playwright/test';

export class OpenAccountPage {
  readonly page: Page;
  readonly customerSelect: Locator;
  readonly currencySelect: Locator;
  readonly currencyOptions: Locator;
  readonly processButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.customerSelect = page.locator('#userSelect');
    this.currencySelect = page.locator('#currency');
    this.currencyOptions = page.locator('#currency option');
    this.processButton = page.getByRole('button', { name: 'Process' });
  }

  // Reached via the manager nav tab, not a direct hash jump: a direct '#/manager/openAccount'
  // navigation renders the customer dropdown empty.
  async goto() {
    await this.page.goto('#/manager');
    await this.page.getByRole('button', { name: 'Open Account' }).click();
    // A closed <select>'s <option>s aren't reported "visible" by Playwright, so check count instead.
    await expect(this.customerSelect.locator('option')).not.toHaveCount(0);
  }

  async selectCustomer(name: string) {
    await this.customerSelect.selectOption({ label: name });
  }

  async selectCurrency(currency: 'Dollar' | 'Pound' | 'Rupee') {
    await this.currencySelect.selectOption(currency);
  }

  // Returns the confirmation alert's text, or '' if submission was blocked (no dialog).
  async process(): Promise<string> {
    let message = '';
    const handled = this.page.waitForEvent('dialog', { timeout: 3000 }).then(async dialog => {
      message = dialog.message();
      await dialog.accept();
    }).catch(() => {});
    await this.processButton.click();
    await handled;
    return message;
  }
}
