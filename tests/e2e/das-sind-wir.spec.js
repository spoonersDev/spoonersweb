const { test, expect } = require('@playwright/test');

test('Das-sind-wir Seite lädt Inhalte dynamisch per API', async ({ page }) => {
  await page.goto('/das-sind-wir-1');

  await expect(page.getByRole('heading', { name: 'Das sind wir' })).toBeVisible();
  await expect(page.getByText('Unterwegs zwischen Alltag, Offroad und Fernweh.')).toBeVisible();
  await expect(page.getByText('Beispielinhalt für Layout- und Scroll-Test.')).toHaveCount(0);
});
