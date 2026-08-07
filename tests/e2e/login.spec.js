const { test, expect } = require('@playwright/test');

test.describe('Admin Login', () => {
  test('erzwingt /admin/login bei direktem Aufruf von /admin ohne Session', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  });

  test('leitet bei gültigen Zugangsdaten in den geschützten Entdecken-Bereich weiter', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Benutzername').fill('admin');
    await page.getByLabel('Passwort').fill('admin123');
    await page.getByRole('button', { name: 'Anmelden' }).click();

    await expect(page).toHaveURL(/\/entdecken$/);
    await expect(page.getByRole('heading', { name: 'Entdecken' })).toBeVisible();
  });

  test('zeigt Fehlermeldung bei ungültigen Zugangsdaten', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Benutzername').fill('admin');
    await page.getByLabel('Passwort').fill('falsch');
    await page.getByRole('button', { name: 'Anmelden' }).click();

    await expect(page.getByText('Ungültige Anmeldedaten')).toBeVisible();
  });
});
