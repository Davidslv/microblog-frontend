import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth';
import api from '../api';

// Mock the api module
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        data: {
          token: 'test-token-123',
          user: { id: 1, username: 'testuser' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password123');

      expect(api.post).toHaveBeenCalledWith('/login', {
        username: 'testuser',
        password: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt_token', 'test-token-123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login without token', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'testuser' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login('testuser', 'password123');

      expect(api.post).toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid credentials');
      api.post.mockRejectedValue(error);

      await expect(authService.login('testuser', 'wrong')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'newuser' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.signup({
        username: 'newuser',
        password: 'password123',
        description: 'Test user',
      });

      expect(api.post).toHaveBeenCalledWith('/users', {
        user: {
          username: 'newuser',
          password: 'password123',
          password_confirmation: 'password123',
          description: 'Test user',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should signup with optional description', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'newuser' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      await authService.signup({
        username: 'newuser',
        password: 'password123',
      });

      expect(api.post).toHaveBeenCalledWith('/users', {
        user: {
          username: 'newuser',
          password: 'password123',
          password_confirmation: 'password123',
          description: '',
        },
      });
    });
  });

  describe('logout', () => {
    it('should logout and remove token', async () => {
      localStorageMock.setItem('jwt_token', 'test-token');
      api.delete.mockResolvedValue({ data: {} });

      await authService.logout();

      expect(api.delete).toHaveBeenCalledWith('/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should remove token even if API call fails', async () => {
      localStorageMock.setItem('jwt_token', 'test-token');
      api.delete.mockRejectedValue(new Error('Network error'));

      // The logout function will throw, but the finally block should still run
      await expect(authService.logout()).rejects.toThrow('Network error');

      expect(api.delete).toHaveBeenCalledWith('/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwt_token');
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user', async () => {
      const mockResponse = {
        data: {
          user: { id: 1, username: 'testuser' },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/me');
      expect(result).toEqual(mockResponse.data.user);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token and store it', async () => {
      const mockResponse = {
        data: {
          token: 'new-token-456',
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(api.post).toHaveBeenCalledWith('/refresh');
      expect(localStorage.setItem).toHaveBeenCalledWith('jwt_token', 'new-token-456');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle refresh without token', async () => {
      const mockResponse = {
        data: {},
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await authService.refreshToken();

      expect(api.post).toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorageMock.setItem('jwt_token', 'test-token');
      localStorage.getItem.mockReturnValue('test-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when token does not exist', () => {
      localStorage.getItem.mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.getItem.mockReturnValue('test-token-123');

      expect(authService.getToken()).toBe('test-token-123');
      expect(localStorage.getItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should return null when token does not exist', () => {
      localStorage.getItem.mockReturnValue(null);

      expect(authService.getToken()).toBe(null);
    });
  });
});

