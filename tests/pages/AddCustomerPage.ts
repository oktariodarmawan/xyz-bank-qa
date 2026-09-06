import { Page, Locator, expect } from '@playwright/test';
import { ManagerPage } from './ManagerPage.js';

export class AddCustomerPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postCodeInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postCodeInput = page.getByRole('textbox', { name: 'Post Code' });
    this.submitButton = page.getByRole('button', { name: 'Add Customer', exact: true }).last();
  }

  async goto() {
    await this.page.goto('#/manager/addCust');
    // Angular bootstrap can outlast goto()'s load event; reload once if the form isn't up yet.
    const appeared = await this.firstNameInput.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (!appeared) {
      await this.page.reload();
      await expect(this.firstNameInput).toBeVisible({ timeout: 15000 });
    }
  }

  async addCustomer(firstName: string, lastName: string, postCode: string): Promise<string> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postCodeInput.fill(postCode);

    let dialogMessage = '';
    this.page.once('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });
    await this.submitButton.click();
    return dialogMessage;
  }

  async goToCustomersList(): Promise<ManagerPage> {
    await this.page.getByRole('button', { name: 'Customers' }).click();
    return new ManagerPage(this.page);
  }
}
