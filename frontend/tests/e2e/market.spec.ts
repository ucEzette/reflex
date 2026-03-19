import { test, expect } from '@playwright/test';

test.describe('Reflex Institutional E2E', () => {
  test('Landing Page loads correctly with Dynamic Solvency Metrics', async ({ page }) => {
    await page.goto('/');
    
    // Verify core value props logic
    await expect(page.getByText('Micro-Insurance')).toBeVisible();
    await expect(page.getByText('Macro Speed')).toBeVisible();

    // Verify Solvency Dashboard streaming RSC
    await expect(page.getByText('Proof of Reserves')).toBeVisible();
    await expect(page.getByText('SOLVENCY RATIO')).toBeVisible();
  });

  test('Marketplace Routing and Dynamic Data', async ({ page }) => {
    // Traverse standard user funnel
    await page.goto('/market');
    
    const flightCard = page.getByText('Flight Delay', { exact: true }).first();
    await expect(flightCard).toBeVisible();

    // Navigate to specific market
    await page.goto('/market/flight-delay');
    await expect(page.getByText('Flight Delay Protection')).toBeVisible();
    
    // Check Widget existence
    await expect(page.getByText('Quick-Policy')).toBeVisible();
  });
});
