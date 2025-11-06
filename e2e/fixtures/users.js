/**
 * Test user fixtures for E2E tests
 * These users should exist in the test database
 */

export const testUsers = {
  user1: {
    username: 'testuser1',
    password: 'password123',
    id: 1, // Assuming this is the ID in test database
  },
  user2: {
    username: 'testuser2',
    password: 'password123',
    id: 2,
  },
  user3: {
    username: 'testuser3',
    password: 'password123',
    id: 3,
  },
};

/**
 * Generate a unique test username
 * @returns {string} Unique username with timestamp
 */
export function generateTestUsername() {
  return `testuser_${Date.now()}`;
}

