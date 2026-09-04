# XYZ Bank — QA test suite

Manual and automated test coverage for the [XYZ Bank demo application](https://www.globalsqa.com/angularJs-protractor/BankingProject/), covering the homepage, Customer Login, and Bank Manager workflows.

## What's in this repo

| Path | Contents |
|---|---|
| [`manual-test-cases/`](manual-test-cases/) | 87 manual test cases across 11 modules (login/role selection, account overview, deposit, withdraw, transactions, add customer, open account, customers list, data persistence/access control, responsive/cross-browser, usability/accessibility). Start at [`manual-test-cases/README.md`](manual-test-cases/README.md). A single-file export for spreadsheets is at [`manual-test-cases/manual-test-cases-export.csv`](manual-test-cases/manual-test-cases-export.csv). |
| [`TEST-PLAN.md`](TEST-PLAN.md) | Original scope summary and test case overview. |
| [`tests/`](tests/) | 74 automated Playwright test cases (84 executions once cross-browser runs are counted), plus a Page Object Model under `tests/pages/`. |
| [`playwright.config.ts`](playwright.config.ts) | Test runner configuration — target URL, browsers, reporters, trace/screenshot/video settings. |

## Tech stack

- [Playwright Test](https://playwright.dev/) with TypeScript
- Chromium (full suite) plus Firefox and WebKit (cross-browser smoke subset)

## Getting started

```bash
npm install
npx playwright install   # downloads the browser binaries Playwright needs
```

Run the full automated suite:

```bash
npm run test:e2e
```

Other useful scripts (see `package.json`):

```bash
npm run test:e2e:ui        # interactive UI mode
npm run test:e2e:headed    # run with a visible browser
npm run report              # open the HTML report from the last run
```

> The suite runs against the live public demo site with `workers: 1` (sequential), since
> customer accounts are shared, mutable state. Re-running deposit/withdraw/add-customer tests
> repeatedly will keep mutating real data on that shared demo instance.

## Test coverage at a glance

- **Manual test cases:** 87, across 11 modules — see [`manual-test-cases/README.md`](manual-test-cases/README.md) for the full breakdown and the column legend (Test Case ID, Description, Preconditions, Steps, Expected Result, Actual Result, Priority, Automation Feasibility).
- **Automated test cases:** 74 unique scenarios (84 executions with cross-browser multiplication), covering login/role selection, account overview, deposit, withdraw, transactions, add customer, open account, customers list search/sort/delete, data persistence, unauthorised access, responsive layout (3 viewports), and cross-browser smoke (Chromium/Firefox/WebKit).

## Known application gaps

Testing this suite against the live site surfaced three confirmed defects/gaps (not test bugs):

1. **Deposit accepts unbounded amounts** — no upper-bound validation.
2. **Post Code accepts non-numeric characters** — no format validation on Add Customer.
3. **Balance and transaction history reset on page refresh** — a full reload does not preserve post-login activity.

Full details, plus a note on an unresolved discrepancy around a route-guard code comment, are in
[`manual-test-cases/README.md`](manual-test-cases/README.md#known-application-gaps).
