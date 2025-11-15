import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Setup import.meta.env for tests
if (typeof import.meta === 'undefined' || !import.meta.env) {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        env: {
          VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000/api/v1',
        },
      },
    },
    writable: true,
    configurable: true,
  });
}

// Mock localStorage for all tests
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

// Cleanup after each test
afterEach(() => {
  cleanup()
  localStorageMock.clear()
})


