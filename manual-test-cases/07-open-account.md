# Module 7 — Bank Manager: Open Account

Not explicitly named in the original scope, but automated because it is a manager-side
counterpart to Add Customer that feeds directly into the customer's account overview (Module 2)
and is required for a customer to have a testable multi-account setup.

| Test Case ID | Test Description | Preconditions | Test Steps | Expected Result | Actual Result | Priority | Automation Feasibility |
|---|---|---|---|---|---|---|---|
| TC-OPEN-001 | Open an account with a valid currency | Navigated as Bank Manager, on Open Account; an existing customer available | 1. Select an existing customer.<br>2. Select a currency (e.g. Dollar).<br>3. Click "Process". | Confirmation message states the account was created successfully with a new account number. | Pass — automated | High | Automated — `tests/open-account.spec.ts` (TC-OPEN-001) |
| TC-OPEN-002 | Process without a selected customer is blocked | Open Account form open, no customer selected | 1. Select a currency only.<br>2. Click "Process". | Submission is blocked by required-field validation on the customer selector; no account is created. | Pass — automated | High | Automated — `tests/open-account.spec.ts` (TC-OPEN-002) |
| TC-OPEN-003 | Process without a selected currency is blocked | Open Account form open, customer selected, no currency | 1. Select a customer only.<br>2. Click "Process". | Submission is blocked by required-field validation on the currency selector; no account is created. | Pass — automated | High | Automated — `tests/open-account.spec.ts` (TC-OPEN-003) |
| TC-OPEN-004 | Currency dropdown shows the full set of options | Open Account form open | 1. Open the Currency dropdown.<br>2. Read the options. | Dollar, Pound, and Rupee are all present. | Pass — automated | Low | Automated — `tests/open-account.spec.ts` (TC-OPEN-004) |
| TC-OPEN-005 | A customer can hold more than one account of the same currency | An existing customer with a known account count | 1. Note the customer's current number of accounts (log in and count).<br>2. Open a new account for that customer with a currency they already hold.<br>3. Log back in as that customer and recount. | The account count increases by exactly one; the new account appears in the Account dropdown. | Pass — automated | Medium | Automated — `tests/open-account.spec.ts` (TC-OPEN-005) |
