import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportsService } from '../reports';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('reportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should report a post', async () => {
    const mockResponse = { data: { message: 'Report submitted' } };
    api.post.mockResolvedValue(mockResponse);

    const result = await reportsService.reportPost(123);

    expect(api.post).toHaveBeenCalledWith('/posts/123/report');
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle errors when reporting a post', async () => {
    const error = new Error('Network error');
    api.post.mockRejectedValue(error);

    await expect(reportsService.reportPost(123)).rejects.toThrow('Network error');
    expect(api.post).toHaveBeenCalledWith('/posts/123/report');
  });
});

