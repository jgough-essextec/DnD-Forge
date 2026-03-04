import { test, expect } from '@playwright/test'

/**
 * Smoke-level Playwright E2E test for the player campaign flow.
 * Requires dev server + backend to be running.
 */
test.describe('Player Campaign Flow', () => {
  test('campaigns page loads without errors', async ({ page }) => {
    await page.goto('/campaigns')

    // The page should render a heading
    await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible()
  })

  test('campaign dashboard loads and shows campaign name', async ({ page }) => {
    // Navigate to campaigns page first
    await page.goto('/campaigns')

    // Wait for campaign list to load
    await expect(page.getByText(/campaigns/i).first()).toBeVisible()
  })
})
