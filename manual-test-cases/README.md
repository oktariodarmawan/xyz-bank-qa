# Manual test cases — XYZ Bank (globalsqa AngularJS Protractor Banking Project)

Target under test: `https://www.globalsqa.com/angularJs-protractor/BankingProject/`

This folder contains the full manual test case set for the homepage, customer, and bank
manager workflows, giving every scenario its own row in the format required for evaluation:
**Test Case ID, Test Description, Preconditions, Test Steps, Expected Result, Actual Result,
Priority, Automation Feasibility.**

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

- **Actual Result** — reflects the last full automated suite run recorded in this project
  (2026-09-06, all three browser projects: Chromium, Firefox, WebKit). Where a test case has
  no automated counterpart, this is marked "Not executed — pending manual QA": it has not
  actually been run, and is not invented here.
- **Automation Feasibility** — `Automated` links to the exact spec file (and, where unambiguous,
  the exact test name in quotes) already implemented under `../tests/`. Spec files are numbered
  `01-`…`15-` to match this catalogue's module order; running `npm run test:e2e` executes them
  in that same sequence. A small number of rows note that the code's own internal test name
  happens to reuse a number already used by a different row in this catalogue — the two
  numbering schemes were assigned independently and are called out explicitly wherever they
  collide, so the correct automated test can still be found unambiguously.
  `Candidate` means it is feasible to automate but has not been built. `Manual only` means the
  check is subjective/visual (styling, wording) and is better suited to human review.
- **Priority** — High: core banking function or blocks further testing if broken. Medium:
  secondary flow or edge case. Low: cosmetic/usability polish.

## Test totals

97 test cases across 11 modules: 80 automated, 16 manual-only, 1 candidate for future
automation (TC-PERS-006).

## Known application gaps

The last full run (2026-09-06) had 4 automated failures out of 93 executions. Three are
confirmed, reproducible defects in the live application, not test-authoring errors:

1. **Deposit accepts unbounded amounts** — no upper-bound validation (see 03-deposit.md, TC-DEP-008).
2. **Post Code accepts non-numeric characters** — no format validation on Add Customer (see 06-add-customer.md, TC-ADD-009).
3. **Balance and transaction history reset on page refresh** — a full reload does not preserve the customer's post-login activity (see 09-data-persistence-and-access-control.md, TC-PERS-001).

The fourth (`TC-TXN-002` in `05-transaction-history.md`) is an **intermittent live-site bug**,
not a deterministic one: the Transactions view occasionally renders empty right after a
deposit+withdraw combo in the same session, even with a built-in retry. `TC-TXN-005` shares the
same underlying live-app quirk and can occasionally fail the same way, though it passed in the
last run.

Report the three confirmed items as defects to the product owner rather than treating the
failing automated tests as broken tests.

**Route-guard discrepancy — resolved.** A previous version of this document flagged that
`tests/access-and-persistence.spec.ts` carried a comment claiming customer sessions could reach
manager controls via direct navigation, while the corresponding test (TC-PERS-003) consistently
passed. That comment was confirmed stale — the underlying app does enforce the route guard —
and has been corrected in the source (now `tests/11-access-and-persistence.spec.ts`). No further
action needed.
