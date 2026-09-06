# XYZ Bank — QA test suite

Manual and automated test coverage for the [XYZ Bank demo application](https://www.globalsqa.com/angularJs-protractor/BankingProject/), covering the homepage, Customer Login, and Bank Manager workflows.

## What's in this repo

| Path | Contents |
|---|---|
| [`manual-test-cases/`](manual-test-cases/) | 97 manual test cases across 11 modules (login/role selection, account overview, deposit, withdraw, transactions, add customer, open account, customers list, data persistence/access control, responsive/cross-browser, usability/accessibility). Start at [`manual-test-cases/README.md`](manual-test-cases/README.md). A CSV export lives alongside it at [`manual-test-cases/manual-test-cases-export.csv`](manual-test-cases/manual-test-cases-export.csv). |
| [`manual-test-cases-excel/`](manual-test-cases-excel/) | The submission-ready Excel version: [`XYZ-Bank-Test-Cases.xlsx`](manual-test-cases-excel/XYZ-Bank-Test-Cases.xlsx), one sheet with all 97 test cases, filterable by Module. Regenerated from `manual-test-cases/*.md` with `npm run export:test-cases` — never edit the `.xlsx` directly. |
| [`tests/`](tests/) | 84 automated Playwright test cases (94 executions once cross-browser runs are counted), numbered `01-`–`15-` to match the manual test case module order, plus a Page Object Model under `tests/pages/`. |
| [`playwright.config.ts`](playwright.config.ts) | Test runner configuration — target URL, browsers, reporters, trace/screenshot/video settings. |

## Tech stack

- [Playwright Test](https://playwright.dev/) with TypeScript
- Chromium (full suite) plus Firefox and WebKit (cross-browser smoke subset — substituting for Edge, see note below)

## How to run this project

### Prerequisites

- [Node.js](https://nodejs.org/) (any current LTS version) and npm, already installed.
- An internet connection — the suite drives the real, live public demo site; there is no local server to start.

### 1. Install dependencies

From the project root:

```bash
npm install
```

### 2. Install the browsers Playwright needs

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit binaries. Only needs to be run once (or again after a Playwright version upgrade).

### 3. Run the full automated suite

```bash
npm run test:e2e
```

This runs all 84 automated test cases (94 executions once Firefox/WebKit cross-browser runs are counted) sequentially against the live demo site. Expect this to take **roughly 10–20 minutes** — it depends on how responsive the live site is that day, not on your machine.

**Expect 3–4 failures on a typical run** — this is normal, not broken. Three are confirmed real defects in the demo application itself (documented below), and one is an intermittent live-site rendering quirk. See [Known application gaps](#known-application-gaps).

### 4. Run a subset instead of everything

```bash
npx playwright test tests/05-deposit.spec.ts       # just one file
npx playwright test -g "TC-DEP-001"                # just one test, by name
npx playwright test --project=chromium             # skip the Firefox/WebKit cross-browser subset
```

### 5. View the results

```bash
npm run report
```

Opens the full interactive HTML report from the last run — pass/fail per test, screenshots and video for anything that failed, and traces you can step through action-by-action.

### 6. Other useful scripts

```bash
npm run test:e2e:ui        # interactive UI mode — step through tests visually
npm run test:e2e:headed    # same tests, with a visible (non-headless) browser window
npm run export:test-cases  # regenerate manual-test-cases-excel/XYZ-Bank-Test-Cases.xlsx and the CSV, from manual-test-cases/*.md
```

> **Why sequential, not parallel:** `playwright.config.ts` sets `workers: 1` deliberately. Customer
> accounts on the live demo site are shared, mutable data — running tests in parallel would let
> them interfere with each other's balances. Re-running deposit/withdraw/add-customer tests
> repeatedly also keeps mutating real data on that shared demo instance; that's expected.

## Publishing this repo to GitHub

If you're setting this project up fresh (not yet a Git repo):

```bash
git init
git add .
git status                 # sanity-check what's staged before committing
git commit -m "Initial commit: XYZ Bank Playwright test suite and manual test cases"
```

Then create an empty **public** repository on GitHub (no README/`.gitignore` from GitHub's
side, to avoid conflicts with what's already here), and push:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

For any change afterwards, the loop is always: `git status` → `git add <files>` → `git commit -m "..."` → `git push`.

## Running tests in GitHub Actions (cloud)

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs the full suite on
GitHub's infrastructure instead of your machine. It's triggered **manually only**
(`workflow_dispatch`) — not on every push — because the suite mutates real data on the shared
live demo site, so it shouldn't fire automatically.

To run it:

1. Push this repo to GitHub (see above).
2. Open the repo on GitHub → **Actions** tab → select **Playwright Tests** in the sidebar.
3. Click **Run workflow** → choose the `main` branch → **Run workflow**.
4. Once the run finishes, open it and scroll to **Artifacts** to download `playwright-report`
   (open `index.html` locally — same report `npm run report` produces) and, if anything failed,
   `test-results` (screenshots/videos/traces).

## Test coverage at a glance

- **Manual test cases:** 97, across 11 modules — see [`manual-test-cases/README.md`](manual-test-cases/README.md) for the full breakdown and the column legend (Test Case ID, Description, Preconditions, Steps, Expected Result, Actual Result, Priority, Automation Feasibility).
- **Automated test cases:** 84 unique scenarios (94 executions with cross-browser multiplication), covering login/role selection, account overview, deposit, withdraw, transactions, add customer, open account, customers list search/sort/delete, data persistence, unauthorised access, responsive layout (3 viewports), and cross-browser smoke (Chromium/Firefox/WebKit).
- **Cross-browser note:** the suite runs Chromium, Firefox, and WebKit. WebKit approximates a non-Chromium engine but is not literally Microsoft Edge — a deliberate substitution, not an oversight.

## Known application gaps

Testing this suite against the live site surfaced three confirmed defects/gaps (not test bugs):

1. **Deposit accepts unbounded amounts** — no upper-bound validation.
2. **Post Code accepts non-numeric characters** — no format validation on Add Customer.
3. **Balance and transaction history reset on page refresh** — a full reload does not preserve post-login activity.

There is also one intermittent, live-site-only flake (the Transactions view can render empty
right after a deposit+withdraw combo in the same session) that is not a defect in this suite.

Full details are in [`manual-test-cases/README.md`](manual-test-cases/README.md#known-application-gaps).
