import api from './api';

export const postsService = {
  async getPosts(filter = 'timeline', cursor = null) {
    const params = { filter };
    if (cursor) {
      params.cursor = cursor;
    }
    const response = await api.get('/posts', { params });
    return response.data;
  },

  async getPost(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  async createPost(content, parentId = null) {
    const response = await api.post('/posts', {
      content,
      parent_id: parentId,
    });
    return response.data;
  },

  async getReplies(postId) {
    const response = await api.get(`/posts/${postId}/replies`);
    return response.data;
  },
};


