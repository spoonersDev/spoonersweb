const { test, expect } = require('@playwright/test');

test('Header zeigt nur Mitglieder-Login und keinen Admin-Link', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Mitglieder-Login' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
});
