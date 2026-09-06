import { test, expect } from '@playwright/test';
import { CustomerLoginPage } from './pages/CustomerLoginPage.js';
import { AddCustomerPage } from './pages/AddCustomerPage.js';

test.describe('deposit validation', () => {
  // TC-008 (empty, zero, negative, decimal, alphabetic sub-cases)
  test('rejects empty, zero, negative, decimal, and alphabetic deposit amounts', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Harry Potter');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    for (const amount of ['', '0', '-50', '12.5']) {
      await accountPage.attemptDeposit(amount);
      expect(await accountPage.getBalance(), `deposit of "${amount}" must not change the balance`).toBe(startingBalance);
    }

    // Alphabetic characters cannot even be typed into a type="number" field.
    await accountPage.depositAmountInput.fill('');
    await accountPage.depositAmountInput.pressSequentially('abc');
    await expect(accountPage.depositAmountInput).toHaveValue('');
    await accountPage.depositSubmitButton.click();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });

  // TC-008 (excessively large amount sub-case)
  // KNOWN FAILURE: the live app currently accepts amounts of any size instead of
  // rejecting excessively large deposits, so this test documents the gap against
  // the TEST-PLAN.md expectation until the app enforces a sane upper bound.
  test('rejects an excessively large deposit amount', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Ron Weasly');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openDepositForm();
    await accountPage.attemptDeposit('999999999999');
    await expect(accountPage.depositSuccessMessage).toBeHidden();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });
});

test.describe('withdrawal validation', () => {
  // TC-010
  test('rejects a withdrawal over the available balance', async ({ page }) => {
    const customerLoginPage = new CustomerLoginPage(page);
    const accountPage = await customerLoginPage.loginAsCustomer('Albus Dumbledore');
    const startingBalance = await accountPage.getBalance();

    await accountPage.openWithdrawForm();
    await accountPage.attemptWithdraw(String(startingBalance + 1000));

    await expect(accountPage.withdrawFailureMessage).toBeVisible();
    expect(await accountPage.getBalance()).toBe(startingBalance);
  });
});

test.describe('add customer validation', () => {
  // TC-013 (missing required fields sub-case)
  test('rejects submission with missing required fields', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();

    await expect(addCustomerPage.firstNameInput).toHaveJSProperty('validity.valid', false);

    let dialogSeen = false;
    page.once('dialog', () => { dialogSeen = true; });
    await addCustomerPage.submitButton.click();
    await page.waitForTimeout(300);

    expect(dialogSeen).toBe(false);
  });

  // TC-013 (invalid post code characters sub-case)
  // KNOWN FAILURE: the live app does not validate the Post Code format and
  // currently accepts alphabetic values, so this test documents the gap
  // against the TEST-PLAN.md expectation until format validation is added.
  test('rejects an invalid (non-numeric) post code', async ({ page }) => {
    const addCustomerPage = new AddCustomerPage(page);
    await addCustomerPage.goto();
    const uniqueName = `PWInvalidPC${Date.now()}`;

    const dialogMessage = await addCustomerPage.addCustomer(uniqueName, 'Automation', 'abcde');
    expect(dialogMessage).not.toContain('successfully');

    await addCustomerPage.goToCustomersList();
    await expect(page.getByText(uniqueName)).toBeHidden();
  });
});
