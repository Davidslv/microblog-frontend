import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usersService } from '../users';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUser', () => {
    it('should fetch user profile', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'testuser', description: 'Test description' },
          posts: [],
          pagination: { cursor: null, has_next: false },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await usersService.getUser(1);

      expect(api.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'testuser', description: 'Updated description' },
        },
      };
      api.patch.mockResolvedValue(mockResponse);

      const result = await usersService.updateUser(1, { description: 'Updated description' });

      expect(api.patch).toHaveBeenCalledWith('/users/1', { description: 'Updated description' });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteUser', () => {
    it('should delete user account', async () => {
      const mockResponse = {
        data: { message: 'User deleted' },
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await usersService.deleteUser(1);

      expect(api.delete).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('followUser', () => {
    it('should follow a user', async () => {
      const mockResponse = {
        data: { message: 'User followed', following: true },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await usersService.followUser(2);

      expect(api.post).toHaveBeenCalledWith('/users/2/follow');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow a user', async () => {
      const mockResponse = {
        data: { message: 'User unfollowed', following: false },
      };
      api.delete.mockResolvedValue(mockResponse);

      const result = await usersService.unfollowUser(2);

      expect(api.delete).toHaveBeenCalledWith('/users/2/follow');
      expect(result).toEqual(mockResponse.data);
    });
  });
});

