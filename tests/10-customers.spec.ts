import { test, expect } from '@playwright/test';
import { CustomersPage } from './pages/CustomersPage.js';
import { AddCustomerPage } from './pages/AddCustomerPage.js';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';

test.describe('Customers', () => {
  test('TC-CUST-001: the customer list is fully displayed', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.goto();

    await expect(page.locator('thead td')).toHaveCount(5);
    await expect(customersPage.firstNameHeader).toBeVisible();
    await expect(customersPage.lastNameHeader).toBeVisible();
    await expect(customersPage.postCodeHeader).toBeVisible();
    await expect(page.locator('thead').getByText('Account Number')).toBeVisible();
    await expect(page.locator('thead').getByText('Delete Customer')).toBeVisible();
    await expect(customersPage.rows.first()).toBeVisible();
    await expect(customersPage.rows.first().getByRole('button', { name: 'Delete' })).toBeVisible();
  });

  test('TC-CUST-002: search filters by name', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.goto();

    await customersPage.search('Harry');

    await expect(customersPage.rows).toHaveCount(1);
    await expect(customersPage.rows.first()).toContainText('Harry');
  });

  test('TC-CUST-003: search with no matching result shows an empty table', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.goto();

    await customersPage.search('zzzzz');

    await expect(customersPage.rows).toHaveCount(0);
  });

  test('TC-CUST-004: search is not case-sensitive', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.goto();

    await customersPage.search('harry');
    const lowerCaseCount = await customersPage.rows.count();

    await customersPage.search('HARRY');
    const upperCaseCount = await customersPage.rows.count();

    expect(upperCaseCount).toBe(lowerCaseCount);
    expect(lowerCaseCount).toBeGreaterThan(0);
  });

  test('TC-CUST-005: delete a customer', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const disposableName = `TCCUST005_${Date.now()}`;
    await addCustomerPage.addCustomer(disposableName, 'ToDelete', '99999');

    await addCustomerPage.goToCustomersList();
    const customersPage = new CustomersPage(page);
    await customersPage.expectCustomerVisible(disposableName);

    await customersPage.deleteCustomer(disposableName);

    await customersPage.expectCustomerHidden(disposableName);
  });

  test('TC-CUST-006: a deleted customer disappears from the login dropdown', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const disposableName = `TCCUST006_${Date.now()}`;
    await addCustomerPage.addCustomer(disposableName, 'ToDelete', '99999');

    await addCustomerPage.goToCustomersList();
    const customersPage = new CustomersPage(page);
    await customersPage.deleteCustomer(disposableName);
    await customersPage.expectCustomerHidden(disposableName);

    const customerLoginPage = new CustomerLoginPage(page);
    await customerLoginPage.goto();

    const optionLabels = await customerLoginPage.customerOptions.allTextContents();
    expect(optionLabels).not.toContain(disposableName);
  });

  test('TC-CUST-007: sort by the First Name column', async ({ page }) => {
    const customersPage = new CustomersPage(page);
    await customersPage.goto();

    await customersPage.firstNameHeader.click();
    const firstClickOrder = await customersPage.firstNameColumnValues();

    await customersPage.firstNameHeader.click();
    const secondClickOrder = await customersPage.firstNameColumnValues();

    const sortedAscending = [...firstClickOrder].sort((a, b) => a.localeCompare(b));
    const sortedDescending = [...sortedAscending].reverse();
    const firstIsSorted = JSON.stringify(firstClickOrder) === JSON.stringify(sortedAscending)
      || JSON.stringify(firstClickOrder) === JSON.stringify(sortedDescending);
    const secondIsSorted = JSON.stringify(secondClickOrder) === JSON.stringify(sortedAscending)
      || JSON.stringify(secondClickOrder) === JSON.stringify(sortedDescending);

    expect(firstIsSorted).toBe(true);
    expect(secondIsSorted).toBe(true);
    expect(firstClickOrder).not.toEqual(secondClickOrder);
  });

  test('TC-CUST-008: a new customer appears in the list', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueName = `TCCUST008_${Date.now()}`;
    await addCustomerPage.addCustomer(uniqueName, 'User', '12345');

    await addCustomerPage.goToCustomersList();
    const customersPage = new CustomersPage(page);

    await customersPage.expectCustomerVisible(uniqueName);
  });
});
