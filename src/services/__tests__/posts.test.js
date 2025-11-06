import { describe, it, expect, beforeEach, vi } from 'vitest';
import { postsService } from '../posts';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('postsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should fetch posts with default filter', async () => {
      const mockResponse = {
        data: {
          posts: [{ id: 1, content: 'Test post' }],
          pagination: { cursor: 'next-cursor', has_next: true },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await postsService.getPosts();

      expect(api.get).toHaveBeenCalledWith('/posts', {
        params: { filter: 'timeline' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch posts with specific filter', async () => {
      const mockResponse = {
        data: {
          posts: [{ id: 1, content: 'My post' }],
          pagination: { cursor: null, has_next: false },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await postsService.getPosts('mine');

      expect(api.get).toHaveBeenCalledWith('/posts', {
        params: { filter: 'mine' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch posts with cursor for pagination', async () => {
      const mockResponse = {
        data: {
          posts: [{ id: 2, content: 'Next post' }],
          pagination: { cursor: 'next-cursor-2', has_next: true },
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await postsService.getPosts('timeline', 'cursor-123');

      expect(api.get).toHaveBeenCalledWith('/posts', {
        params: { filter: 'timeline', cursor: 'cursor-123' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getPost', () => {
    it('should fetch a single post', async () => {
      const mockResponse = {
        data: {
          post: { id: 1, content: 'Test post', author: { id: 1, username: 'user1' } },
          replies: [],
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await postsService.getPost(1);

      expect(api.get).toHaveBeenCalledWith('/posts/1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockResponse = {
        data: {
          post: { id: 1, content: 'New post', author: { id: 1, username: 'user1' } },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await postsService.createPost('New post');

      expect(api.post).toHaveBeenCalledWith('/posts', {
        content: 'New post',
        parent_id: null,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should create a reply post', async () => {
      const mockResponse = {
        data: {
          post: { id: 2, content: 'Reply', parent_id: 1 },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const result = await postsService.createPost('Reply', 1);

      expect(api.post).toHaveBeenCalledWith('/posts', {
        content: 'Reply',
        parent_id: 1,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getReplies', () => {
    it('should fetch replies for a post', async () => {
      const mockResponse = {
        data: {
          replies: [
            { id: 2, content: 'Reply 1', parent_id: 1 },
            { id: 3, content: 'Reply 2', parent_id: 1 },
          ],
        },
      };
      api.get.mockResolvedValue(mockResponse);

      const result = await postsService.getReplies(1);

      expect(api.get).toHaveBeenCalledWith('/posts/1/replies');
      expect(result).toEqual(mockResponse.data);
    });
  });
});

