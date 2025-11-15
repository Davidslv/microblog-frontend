import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import api from '../api';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    })),
    post: vi.fn(),
  },
}));

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should be an axios instance', () => {
    expect(api).toBeDefined();
    expect(axios.create).toHaveBeenCalled();
  });

  it('should configure base URL from environment', () => {
    const originalEnv = import.meta.env.VITE_API_URL;
    import.meta.env.VITE_API_URL = 'http://test-api.com/api/v1';

    // Re-import to get new config
    vi.resetModules();
    require('../api').default;

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://test-api.com/api/v1',
      })
    );

    import.meta.env.VITE_API_URL = originalEnv;
  });

  it('should use default base URL when env var not set', () => {
    const originalEnv = import.meta.env.VITE_API_URL;
    delete import.meta.env.VITE_API_URL;

    vi.resetModules();
    require('../api').default;

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:3000/api/v1',
      })
    );

    import.meta.env.VITE_API_URL = originalEnv;
  });
});

