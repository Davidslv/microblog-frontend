import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
    }
    return response.data;
  },

  async signup(userData) {
    const response = await api.post('/users', {
      user: {
        username: userData.username,
        password: userData.password,
        password_confirmation: userData.password,
        description: userData.description || '',
      },
    });
    return response.data;
  },

  async logout() {
    try {
      await api.delete('/logout');
    } finally {
      localStorage.removeItem('jwt_token');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/me');
    return response.data.user;
  },

  async refreshToken() {
    const response = await api.post('/refresh');
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
    }
    return response.data;
  },

  isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
  },

  getToken() {
    return localStorage.getItem('jwt_token');
  },
};


