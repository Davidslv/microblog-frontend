/**
 * Authentication helpers for E2E tests
 */

/**
 * Login as a user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} username - Username to login with
 * @param {string} password - Password to login with
 */
export async function loginAs(page, username, password) {
  await page.goto('/login');
  await page.fill('input[type="text"]', username);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('/');
}

/**
 * Logout current user
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function logout(page) {
  await page.getByRole('button', { name: /logout/i }).click();
  await page.waitForURL(/\//);
}

/**
 * Signup a new user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} username - Username for new account
 * @param {string} password - Password for new account
 * @param {string} description - Optional description
 */
export async function signup(page, username, password, description = '') {
  await page.goto('/signup');
  await page.fill('input[type="text"]', username);
  await page.fill('input[type="password"]', password);
  if (description) {
    await page.fill('input[placeholder*="Tell us about yourself"]', description);
  }
  await page.getByRole('button', { name: /sign up/i }).click();
  await page.waitForURL('/');
}

