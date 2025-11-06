import { test, expect } from '@playwright/test';

test.describe('Microblog Frontend', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Microblog/);
  });

  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    // Should see public posts or login prompt
    const loginLink = page.getByRole('link', { name: /login/i });
    await expect(loginLink).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  });
});

