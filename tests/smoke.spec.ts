import { test, expect } from '@playwright/test';

test('Playwright browser smoke test', async ({ page }) => {
  await page.goto('data:text/html,<title>XYZ Bank</title><main>Ready</main>');
  await expect(page).toHaveTitle('XYZ Bank');
  await expect(page.getByText('Ready')).toBeVisible();
});
