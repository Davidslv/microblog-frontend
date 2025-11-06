import api from './api';

export const usersService = {
  async getUser(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  async followUser(userId) {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  async unfollowUser(userId) {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  },
};


