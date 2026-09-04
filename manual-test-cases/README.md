# Manual test cases — XYZ Bank (globalsqa AngularJS Protractor Banking Project)

Target under test: `https://www.globalsqa.com/angularJs-protractor/BankingProject/`

This folder contains the full manual test case set for the homepage, customer, and bank
manager workflows. It complements `../TEST-PLAN.md` (the original scope summary) by giving
every scenario its own row in the format required for evaluation: **Test Case ID, Test
Description, Preconditions, Test Steps, Expected Result, Actual Result, Priority, Automation
Feasibility.**

## Files

| File | Module |
|---|---|
| [01-login-and-role-selection.md](01-login-and-role-selection.md) | Homepage, role selection, customer login |
| [02-customer-dashboard-and-account-overview.md](02-customer-dashboard-and-account-overview.md) | Account info panel, account switching, logout |
| [03-deposit.md](03-deposit.md) | Deposit functionality |
| [04-withdraw.md](04-withdraw.md) | Withdraw functionality |
| [05-transaction-history.md](05-transaction-history.md) | Transactions view |
| [06-add-customer.md](06-add-customer.md) | Bank Manager — Add Customer |
| [07-open-account.md](07-open-account.md) | Bank Manager — Open Account |
| [08-customers-list-search-filter-sort.md](08-customers-list-search-filter-sort.md) | Bank Manager — Customers list, search, sort, delete |
| [09-data-persistence-and-access-control.md](09-data-persistence-and-access-control.md) | Data persistence and unauthorised access |
| [10-responsive-and-cross-browser.md](10-responsive-and-cross-browser.md) | Responsive layout and cross-browser smoke |
| [11-usability-and-accessibility.md](11-usability-and-accessibility.md) | Usability and accessibility checks (manual-only) |

## Column legend

- **Actual Result** — reflects the last automated suite run recorded in this project
  (`test-results/`, `chromium` project, 2026-09-03). Where a test case has no automated
  counterpart, this is marked "Not executed — pending manual QA": it has not actually been
  run, and is not invented here.
- **Automation Feasibility** — `Automated` links to the exact spec file and test ID already
  implemented under `../tests/`. `Candidate` means it is feasible to automate but has not been
  built. `Manual only` means the check is subjective/visual (styling, wording) and is better
  suited to human review.
- **Priority** — High: core banking function or blocks further testing if broken. Medium:
  secondary flow or edge case. Low: cosmetic/usability polish.

## Known application gaps

Five automated tests failed in the last recorded run (`test-results/.last-run.json`,
chromium project, 2026-09-03). Three of them are confirmed, reproducible defects/gaps in the
live application, not test-authoring errors:

1. **Deposit accepts unbounded amounts** — no upper-bound validation (see 03-deposit.md, TC-DEP-008).
2. **Post Code accepts non-numeric characters** — no format validation on Add Customer (see 06-add-customer.md, TC-ADD-009).
3. **Balance and transaction history reset on page refresh** — a full reload does not preserve the customer's post-login activity (see 09-data-persistence-and-access-control.md, TC-PERS-001).

The other two failures (`TC-TXN-002`, `TC-TXN-005` in `05-transaction-history.md`) are an
**intermittent live-site bug**, not a deterministic one: the Transactions view occasionally
renders empty right after a deposit+withdraw combo in the same session. Treat these as flaky
until re-confirmed on a fresh run.

Report the three confirmed items as defects to the product owner rather than treating the
failing automated tests as broken tests.

**Note on the route-guard code comment:** `tests/access-and-persistence.spec.ts` carries a
comment claiming customer sessions can reach manager controls via direct navigation ("no
client-side route guard"). That specific test did **not** fail in the last recorded run — it
passed — so the comment does not match the last observed result. This is flagged as an
unresolved discrepancy in 09-data-persistence-and-access-control.md (TC-PERS-003) rather than
reported as a confirmed defect; it needs a fresh manual check before anyone acts on it.
