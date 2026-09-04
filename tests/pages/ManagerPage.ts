import { Page, Locator, expect } from '@playwright/test';
import { AddCustomerPage } from './AddCustomerPage.js';
import { OpenAccountPage } from './OpenAccountPage.js';
import { CustomersPage } from './CustomersPage.js';

export class ManagerPage {
  readonly page: Page;
  readonly addCustomerNavButton: Locator;
  readonly openAccountNavButton: Locator;
  readonly customersNavButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addCustomerNavButton = page.getByRole('button', { name: 'Add Customer' }).first();
    this.openAccountNavButton = page.getByRole('button', { name: 'Open Account' });
    this.customersNavButton = page.getByRole('button', { name: 'Customers' });
  }

  async goto() {
    await this.page.goto('#/manager');
  }

  async goToAddCustomer(): Promise<AddCustomerPage> {
    await this.addCustomerNavButton.click();
    return new AddCustomerPage(this.page);
  }

  async goToOpenAccount(): Promise<OpenAccountPage> {
    await this.openAccountNavButton.click();
    await expect(this.page).toHaveURL(/#\/manager\/openAccount$/);
    return new OpenAccountPage(this.page);
  }

  async goToCustomersList() {
    await this.customersNavButton.click();
  }

  async goToCustomers(): Promise<CustomersPage> {
    await this.customersNavButton.click();
    await expect(this.page).toHaveURL(/#\/manager\/list$/);
    return new CustomersPage(this.page);
  }

  async expectCustomerListed(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
