import { Page, Locator, expect } from '@playwright/test';
import { TransactionsPage } from './TransactionsPage.js';
import { CustomerLoginPage } from './CustomerLoginPage.js';

export class AccountPage {
  readonly page: Page;
  readonly accountSelect: Locator;
  readonly accountNumberLabel: Locator;
  readonly currencyLabel: Locator;
  readonly accountNumberValue: Locator;
  readonly currencyValue: Locator;
  readonly balance: Locator;
  readonly depositButton: Locator;
  readonly withdrawButton: Locator;
  readonly transactionsButton: Locator;
  readonly logoutButton: Locator;
  readonly depositAmountInput: Locator;
  readonly depositSubmitButton: Locator;
  readonly depositSuccessMessage: Locator;
  readonly withdrawAmountInput: Locator;
  readonly withdrawSubmitButton: Locator;
  readonly withdrawSuccessMessage: Locator;
  readonly withdrawFailureMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accountSelect = page.locator('#accountSelect');
    this.accountNumberLabel = page.getByText('Account Number :');
    this.currencyLabel = page.getByText('Currency :');
    this.accountNumberValue = page.locator('.center strong').first();
    this.balance = page.locator('.center strong').nth(1);
    this.currencyValue = page.locator('.center strong').nth(2);
    // Exact + first(): once the deposit form is open, its submit button is also named
    // exactly "Deposit", making the plain role query ambiguous between the tab and the form.
    this.depositButton = page.getByRole('button', { name: 'Deposit', exact: true }).first();
    this.withdrawButton = page.getByRole('button', { name: 'Withdrawl' });
    this.transactionsButton = page.getByRole('button', { name: 'Transactions' });
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
    this.depositAmountInput = page.getByRole('spinbutton', { name: 'amount' });
    this.depositSubmitButton = page.getByRole('button', { name: 'Deposit', exact: true }).last();
    this.depositSuccessMessage = page.getByText('Deposit Successful');
    this.withdrawAmountInput = page.getByRole('spinbutton').last();
    this.withdrawSubmitButton = page.getByRole('button', { name: 'Withdraw', exact: true });
    this.withdrawSuccessMessage = page.getByText(/(Withdrawl|Withdrawal|Transaction) Successful/i);
    this.withdrawFailureMessage = page.getByText(/Transaction Failed/i);
  }

  welcomeMessage(customer: string): Locator {
    return this.page.getByText(`Welcome ${customer} !!`);
  }

  async selectAccount(accountNumber: string) {
    await this.accountSelect.selectOption(accountNumber);
  }

  async getBalance(): Promise<number> {
    return Number(await this.balance.textContent());
  }

  /**
   * Switching tabs (Deposit/Withdrawl/Transactions) does not swap the form in the DOM
   * synchronously with the click, so callers must wait for this tab's own form label
   * before interacting with it — otherwise they can end up filling the previous tab's form.
   */
  async openDepositForm() {
    await this.depositButton.click();
    await this.page.getByText('Amount to be Deposited :').waitFor();
  }

  /** Fills and submits the deposit form without asserting the outcome, so invalid inputs can be exercised. */
  async attemptDeposit(amount: string) {
    await this.depositAmountInput.fill(amount);
    await this.depositSubmitButton.click();
  }

  async deposit(amount: number) {
    await this.openDepositForm();
    await this.attemptDeposit(String(amount));
    await expect(this.depositSuccessMessage).toBeVisible();
  }

  async openWithdrawForm() {
    await this.withdrawButton.click();
    await this.page.getByText('Amount to be Withdrawn :').waitFor();
  }

  async setWithdrawAmount(amount: string) {
    await this.withdrawAmountInput.fill(amount);
  }

  /** Sets and submits the withdrawal form without asserting the outcome, so invalid inputs can be exercised. */
  async attemptWithdraw(amount: string) {
    await this.setWithdrawAmount(amount);
    await this.withdrawSubmitButton.click();
  }

  async withdraw(amount: number) {
    await this.openWithdrawForm();
    await this.attemptWithdraw(String(amount));
    await expect(this.withdrawSuccessMessage).toBeVisible();
  }

  async goToTransactions(): Promise<TransactionsPage> {
    await this.transactionsButton.click();
    await expect(this.page).toHaveURL(/#\/listTx$/);
    return new TransactionsPage(this.page);
  }

  async logout(): Promise<CustomerLoginPage> {
    await this.logoutButton.click();
    await expect(this.page).toHaveURL(/#\/customer$/);
    return new CustomerLoginPage(this.page);
  }
}
