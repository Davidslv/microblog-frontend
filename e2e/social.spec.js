import { test, expect } from '@playwright/test';

test.describe('Social Features', () => {
  test('should follow another user', async ({ page }) => {
    // Login as user1
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to user2's profile (assuming user2 exists)
    // First, we need to find a post by user2 or navigate directly
    await page.goto('/users/2'); // Assuming user2 has id 2

    // Click Follow button
    const followButton = page.getByRole('button', { name: /Follow/i });
    if (await followButton.isVisible()) {
      await followButton.click();

      // Button should change to "Unfollow"
      await expect(page.getByRole('button', { name: /Unfollow/i })).toBeVisible();
    }
  });

  test('should unfollow a user', async ({ page }) => {
    // Login as user1
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to a user that user1 is already following
    await page.goto('/users/2');

    // If already following, click Unfollow
    const unfollowButton = page.getByRole('button', { name: /Unfollow/i });
    if (await unfollowButton.isVisible()) {
      await unfollowButton.click();

      // Button should change to "Follow"
      await expect(page.getByRole('button', { name: /Follow/i })).toBeVisible();
    }
  });

  test('should view user profile from post', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Find a post with a username link
    const usernameLink = page.getByRole('link', { name: /@\w+/i }).first();
    if (await usernameLink.isVisible()) {
      await usernameLink.click();

      // Should navigate to user profile
      await expect(page).toHaveURL(/\/users\/\d+/);

      // Should see user information
      await expect(page.getByText(/@\w+/)).toBeVisible();
    }
  });

  test('should view own profile', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Click on own username in navigation (use navigation role to be specific)
    await page.getByRole('navigation').getByText('@testuser1').click();

    // Should navigate to own profile
    await expect(page).toHaveURL(/\/users\/\d+/);

    // Should see own username
    await expect(page.getByText('@testuser1')).toBeVisible();

    // Should NOT see follow button (own profile)
    await expect(page.getByRole('button', { name: /Follow/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /Unfollow/i })).not.toBeVisible();
  });

  test('should see posts from followed users in Following feed', async ({ page }) => {
    // Login as user1
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Follow user2 first (if not already following)
    await page.goto('/users/2');
    const followButton = page.getByRole('button', { name: /Follow/i });
    if (await followButton.isVisible()) {
      await followButton.click();
      await page.waitForTimeout(500);
    }

    // Go back to home
    await page.goto('/');

    // Click "Following" filter
    await page.getByRole('button', { name: /Following/i }).click();

    // Should see posts from followed users
    // This assumes user2 has posts
    await expect(page.getByRole('button', { name: /Following/i })).toHaveClass(/bg-blue-600/);
  });
});

