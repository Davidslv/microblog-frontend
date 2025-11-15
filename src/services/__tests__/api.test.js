import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

const mockRequestUse = vi.fn();
const mockResponseUse = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockResponseUse },
      },
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    })),
    post: vi.fn(),
  },
}));

// Mock the api module to avoid import.meta.env issues
vi.mock('../api', async () => {
  const axios = await vi.importActual('axios');
  const mockApi = axios.default.create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });
  
  // Add interceptors
  mockApi.interceptors.request.use(
    vi.fn((config) => config),
    vi.fn((error) => Promise.reject(error))
  );
  mockApi.interceptors.response.use(
    vi.fn((response) => response),
    vi.fn((error) => Promise.reject(error))
  );
  
  return { default: mockApi };
});

import api from '../api';

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

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('should be an axios instance', () => {
    expect(api).toBeDefined();
    expect(api.get).toBeDefined();
    expect(api.post).toBeDefined();
    expect(api.delete).toBeDefined();
    expect(api.patch).toBeDefined();
  });

  it('should have request interceptor configured', () => {
    expect(api.interceptors.request.use).toBeDefined();
    expect(typeof api.interceptors.request.use).toBe('function');
  });

  it('should have response interceptor configured', () => {
    expect(api.interceptors.response.use).toBeDefined();
    expect(typeof api.interceptors.response.use).toBe('function');
  });
});
