import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (assuming it's running on localhost:5173)
    await page.goto('/');
  });

  test('should allow user signup', async ({ page }) => {
    // Navigate to signup page
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/.*signup/);

    // Generate unique username to avoid conflicts
    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;

    // Fill in signup form
    await page.fill('input[type="text"]', username);
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[placeholder*="Tell us about yourself"]', 'Test user description');

    // Submit form
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should redirect to home page (wait a bit for redirect)
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Should be logged in (check for username in navigation)
    await expect(page.getByText(`@${username}`)).toBeVisible();
  });

  test('should allow user login', async ({ page }) => {
    // Navigate to login page
    await page.getByRole('link', { name: /login/i }).click();
    await expect(page).toHaveURL(/.*login/);

    // Fill in login form
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.getByRole('button', { name: /login/i }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should be logged in
    await expect(page.getByText('@testuser1')).toBeVisible();
  });

  test('should show error on invalid login credentials', async ({ page }) => {
    await page.getByRole('link', { name: /login/i }).click();

    // Fill in invalid credentials
    await page.fill('input[type="text"]', 'invaliduser');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.getByRole('button', { name: /login/i }).click();

    // Should show error message (could be in various formats)
    // Wait for error to appear - it might be in a div with red styling
    await expect(
      page.locator('.bg-red-100, .text-red-700, [class*="red"]').filter({ hasText: /invalid|error|Invalid/i }).first()
    ).toBeVisible({ timeout: 10000 });

    // Should remain on login page
    await expect(page).toHaveURL(/.*login/);
  });

  test('should allow user logout', async ({ page }) => {
    // First login
    await page.getByRole('link', { name: /login/i }).click();
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Click logout
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to home or login
    await expect(page).toHaveURL(/\//);

    // Should show login/signup links
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign Up/i }).first()).toBeVisible();
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: /login/i }).click();
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Try to navigate to login page
    await page.goto('/login');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });

  test('should redirect authenticated users away from signup page', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: /login/i }).click();
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Try to navigate to signup page
    await page.goto('/signup');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });
});

