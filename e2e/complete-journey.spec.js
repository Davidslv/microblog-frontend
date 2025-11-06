import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete full user workflow', async ({ page }) => {
    // Step 1: Signup - Create new account
    await page.goto('/');
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL(/.*signup/);

    const timestamp = Date.now();
    const username = `testuser_${timestamp}`;

    await page.fill('input[type="text"]', username);
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[placeholder*="Tell us about yourself"]', 'Complete journey test user');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Should redirect to home after signup
    await expect(page).toHaveURL('/');
    await expect(page.getByText(`@${username}`)).toBeVisible();

    // Step 2: Create first post
    const textarea = page.getByPlaceholder("What's on your mind?");
    await textarea.fill('Hello world! My first post.');
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    await expect(page.getByText('Hello world! My first post.')).toBeVisible();

    // Step 3: View own profile
    await page.getByText(`@${username}`).click();
    await expect(page).toHaveURL(/\/users\/\d+/);
    await expect(page.getByText(`@${username}`)).toBeVisible();
    await expect(page.getByText('Hello world! My first post.')).toBeVisible();

    // Step 4: Follow another user (assuming testuser1 exists)
    await page.goto('/users/1'); // Assuming user with id 1 exists
    const followButton = page.getByRole('button', { name: /Follow/i });
    if (await followButton.isVisible()) {
      await followButton.click();
      await expect(page.getByRole('button', { name: /Unfollow/i })).toBeVisible();
    }

    // Step 5: View Following feed
    await page.goto('/');
    await page.getByRole('button', { name: /Following/i }).click();
    await expect(page.getByRole('button', { name: /Following/i })).toHaveClass(/bg-blue-600/);

    // Step 6: Reply to another user's post
    // First, find a post from a followed user or navigate to a specific post
    await page.goto('/posts/1'); // Assuming post 1 exists
    const replyTextarea = page.getByPlaceholder("Write your reply...");
    if (await replyTextarea.isVisible()) {
      await replyTextarea.fill('This is my reply to the post!');
      await page.getByRole('button', { name: /Reply/i }).click();
      await expect(page.getByText('This is my reply to the post!')).toBeVisible();
    }

    // Step 7: View thread
    const viewThreadLink = page.getByText('View thread');
    if (await viewThreadLink.isVisible()) {
      await viewThreadLink.click();
      await expect(page).toHaveURL(/\/posts\/\d+/);
    }

    // Step 8: View another user's profile
    await page.goto('/users/1');
    await expect(page).toHaveURL(/\/users\/\d+/);

    // Step 9: Follow another user
    const followButton2 = page.getByRole('button', { name: /Follow/i });
    if (await followButton2.isVisible()) {
      await followButton2.click();
      await expect(page.getByRole('button', { name: /Unfollow/i })).toBeVisible();
    }

    // Step 10: Create another post
    await page.goto('/');
    await textarea.fill('Second post from complete journey test!');
    await page.getByRole('button', { name: 'Post', exact: true }).click();
    await expect(page.getByText('Second post from complete journey test!')).toBeVisible();

    // Step 11: View Timeline feed
    await page.getByRole('button', { name: /Timeline/i }).click();
    await expect(page.getByRole('button', { name: /Timeline/i })).toHaveClass(/bg-blue-600/);

    // Step 12: Logout
    await page.getByRole('button', { name: /Logout/i }).click();
    await expect(page).toHaveURL(/\//);

    // Verify session is cleared
    await expect(page.getByRole('link', { name: /Login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sign Up/i })).toBeVisible();
    await expect(page.getByText(`@${username}`)).not.toBeVisible();
  });
});

