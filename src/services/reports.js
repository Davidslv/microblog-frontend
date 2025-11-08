import api from './api';

export const reportsService = {
  async reportPost(postId) {
    const response = await api.post(`/posts/${postId}/report`);
    return response.data;
  },
};

