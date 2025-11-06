import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatDate } from '../formatDate';

describe('formatDate', () => {
  beforeEach(() => {
    // Mock current time to 2024-01-01 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "just now" for times less than 60 seconds ago', () => {
    const date = new Date('2024-01-01T11:59:30Z');
    expect(formatDate(date.toISOString())).toBe('just now');
  });

  it('should return minutes ago for 1 minute', () => {
    const date = new Date('2024-01-01T11:59:00Z');
    expect(formatDate(date.toISOString())).toBe('1 minute ago');
  });

  it('should return minutes ago for multiple minutes', () => {
    const date = new Date('2024-01-01T11:45:00Z');
    expect(formatDate(date.toISOString())).toBe('15 minutes ago');
  });

  it('should return hours ago for 1 hour', () => {
    const date = new Date('2024-01-01T11:00:00Z');
    expect(formatDate(date.toISOString())).toBe('1 hour ago');
  });

  it('should return hours ago for multiple hours', () => {
    const date = new Date('2024-01-01T09:00:00Z');
    expect(formatDate(date.toISOString())).toBe('3 hours ago');
  });

  it('should return days ago for 1 day', () => {
    const date = new Date('2023-12-31T12:00:00Z');
    expect(formatDate(date.toISOString())).toBe('1 day ago');
  });

  it('should return days ago for multiple days (less than 7)', () => {
    const date = new Date('2023-12-28T12:00:00Z');
    expect(formatDate(date.toISOString())).toBe('4 days ago');
  });

  it('should return formatted date for more than 7 days', () => {
    const date = new Date('2023-12-20T12:00:00Z');
    const result = formatDate(date.toISOString());
    // Should return a date string (format depends on locale)
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('should handle edge case of exactly 60 seconds', () => {
    const date = new Date('2024-01-01T11:59:00Z');
    expect(formatDate(date.toISOString())).toBe('1 minute ago');
  });

  it('should handle edge case of exactly 24 hours', () => {
    const date = new Date('2023-12-31T12:00:00Z');
    expect(formatDate(date.toISOString())).toBe('1 day ago');
  });

  it('should handle edge case of exactly 7 days', () => {
    const date = new Date('2023-12-25T12:00:00Z');
    const result = formatDate(date.toISOString());
    // Should return formatted date (not "7 days ago")
    expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });
});

