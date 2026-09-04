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

  /**
   * Deliberately does not hash-jump straight to '#/manager/openAccount': on the live app the
   * customer dropdown here only gets populated when this view is reached by clicking the
   * "Open Account" tab from '#/manager' — a direct hash navigation renders the form with an
   * empty customer list (observed while building this suite).
   */
  async goto() {
    await this.page.goto('#/manager');
    await this.page.getByRole('button', { name: 'Open Account' }).click();
    // <option> elements inside a native, closed <select> aren't reported as "visible" by
    // Playwright even once populated, so wait on the option count instead of visibility.
    await expect(this.customerSelect.locator('option')).not.toHaveCount(0);
  }

  async selectCustomer(name: string) {
    await this.customerSelect.selectOption({ label: name });
  }

  async selectCurrency(currency: 'Dollar' | 'Pound' | 'Rupee') {
    await this.currencySelect.selectOption(currency);
  }

  /** Clicks Process and returns the confirmation alert's text, or '' if no dialog appeared (blocked submission). */
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
