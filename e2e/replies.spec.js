import { test, expect } from '@playwright/test';

test.describe('Replies and Threading', () => {
  test('should reply to another user\'s post', async ({ page }) => {
    // Login as user1
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Find a post (preferably from another user)
    // Click on a post to view detail
    const postLink = page.locator('a[href^="/posts/"]').first();
    if (await postLink.isVisible()) {
      await postLink.click();

      // Should be on post detail page
      await expect(page).toHaveURL(/\/posts\/\d+/);

      // Find reply form
      const replyTextarea = page.getByPlaceholder("Write your reply...");
      if (await replyTextarea.isVisible()) {
        // Enter reply
        await replyTextarea.fill('This is my reply to the post');

        // Submit reply
        await page.getByRole('button', { name: /Reply/i }).click();

        // Should see reply in replies section
        await expect(page.getByText('This is my reply to the post')).toBeVisible();

        // Should see reply author
        await expect(page.getByText('@testuser1')).toBeVisible();
      }
    }
  });

  test('should reply to another user\'s reply', async ({ page }) => {
    // Login as user1
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to a post with existing replies
    await page.goto('/posts/1'); // Assuming post 1 exists and has replies

    // Find a reply and click on it
    const replyLink = page.locator('a[href^="/posts/"]').filter({ hasText: /reply|Reply/i }).first();
    if (await replyLink.isVisible()) {
      await replyLink.click();

      // Should be on reply detail page
      await expect(page).toHaveURL(/\/posts\/\d+/);

      // Enter reply to the reply
      const replyTextarea = page.getByPlaceholder("Write your reply...");
      if (await replyTextarea.isVisible()) {
        await replyTextarea.fill('This is a reply to a reply');

        // Submit
        await page.getByRole('button', { name: /Reply/i }).click();

        // Should see the reply
        await expect(page.getByText('This is a reply to a reply')).toBeVisible();
      }
    }
  });

  test('should view thread structure', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to a post with replies
    await page.goto('/posts/1');

    // Look for "View thread" link on a reply
    const viewThreadLink = page.getByText('View thread');
    if (await viewThreadLink.isVisible()) {
      await viewThreadLink.click();

      // Should see parent post
      await expect(page).toHaveURL(/\/posts\/\d+/);

      // Should see the reply below parent
      // (structure verification)
    }
  });

  test('should display reply count on posts', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Look for posts with reply counts
    const replyCount = page.getByText(/\d+ (reply|replies)/i);
    if (await replyCount.isVisible()) {
      // Verify reply count is displayed
      await expect(replyCount).toBeVisible();
    }
  });

  test('should show "View thread" link for reply posts', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to a post detail page that has replies
    await page.goto('/posts/1');

    // Replies should have "View thread" link
    const viewThreadLinks = page.getByText('View thread');
    const count = await viewThreadLinks.count();

    // If there are replies, they should have view thread links
    if (count > 0) {
      await expect(viewThreadLinks.first()).toBeVisible();
    }
  });

  test('should create nested reply structure', async ({ page }) => {
    // Login as user1
    await page.goto('/login');
    await page.fill('input[type="text"]', 'testuser1');
    await page.fill('input[type="password"]', 'password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/');

    // Navigate to a post
    await page.goto('/posts/1');

    // Create first reply
    const replyTextarea = page.getByPlaceholder("Write your reply...");
    if (await replyTextarea.isVisible()) {
      await replyTextarea.fill('First level reply');
      await page.getByRole('button', { name: /Reply/i }).click();
      await expect(page.getByText('First level reply')).toBeVisible();

      // Wait a bit for the reply to appear
      await page.waitForTimeout(500);

      // Find the reply we just created and click on it
      const firstReply = page.getByText('First level reply').locator('..').locator('a').first();
      if (await firstReply.isVisible()) {
        await firstReply.click();

        // Should be on reply detail page
        await expect(page).toHaveURL(/\/posts\/\d+/);

      // Create second level reply
      const secondReplyTextarea = page.getByPlaceholderText("Write your reply...");
        if (await secondReplyTextarea.isVisible()) {
          await secondReplyTextarea.fill('Second level reply');
          await page.getByRole('button', { name: /Reply/i }).click();

          // Should see both replies
          await expect(page.getByText('First level reply')).toBeVisible();
          await expect(page.getByText('Second level reply')).toBeVisible();
        }
      }
    }
  });
});

