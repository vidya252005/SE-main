// src/utils/api.js
import axios from 'axios';

// ================================
// 🔧 Axios Configuration
// ================================
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach restaurant token (or user token) automatically
api.interceptors.request.use((req) => {
  const restaurantToken = localStorage.getItem('restaurantToken');
  const userToken = localStorage.getItem('token');

  if (restaurantToken) {
    req.headers.Authorization = `Bearer ${restaurantToken}`;
  } else if (userToken) {
    req.headers.Authorization = `Bearer ${userToken}`;
  }

  return req;
});

// ================================
// 🔐 Auth API
// ================================
export const authAPI = {
  // User registration & login
  userRegister: async (userData) => (await api.post('/auth/user/register', userData)).data,
  userLogin: async (credentials) => (await api.post('/auth/user/login', credentials)).data,

  // Restaurant registration & login
  restaurantRegister: async (restaurantData) =>
    (await api.post('/auth/restaurant/register', restaurantData)).data,

  restaurantLogin: async (credentials) =>
    (await api.post('/auth/restaurant/login', credentials)).data,
};

// ================================
// 🍽️ Restaurant API
// ================================
export const restaurantAPI = {
  getAll: async () => (await api.get('/restaurants')).data,

  getById: async (id) => (await api.get(`/restaurants/${id}`)).data,

  search: async (query) => (await api.get(`/restaurants/search/${query}`)).data,

  update: async (id, data) =>
    (await api.put(`/restaurants/${id}`, data)).data,

  // 🧾 Stats (for dashboard)
  getStats: async () => (await api.get('/restaurant/stats')).data,

  // 🍔 Menu Management (Authenticated)
  addMenuItem: async (menuItem) =>
    (await api.post(`/restaurant/menu`, menuItem)).data,

  updateMenuItem: async (menuItemId, menuItem) =>
    (await api.put(`/restaurant/menu/${menuItemId}`, menuItem)).data,

  deleteMenuItem: async (menuItemId) =>
    (await api.delete(`/restaurant/menu/${menuItemId}`)).data,
};


// ================================
// 🛒 Order API
// ================================
export const orderAPI = {
  create: async (orderData) => (await api.post('/orders', orderData)).data,

  getUserOrders: async (userId) => (await api.get(`/orders/user/${userId}`)).data,

  getRestaurantOrders: async (restaurantId) =>
    (await api.get(`/orders/restaurant/${restaurantId}`)).data,

  updateStatus: async (orderId, status) =>
    (await api.patch(`/orders/${orderId}/status`, { status })).data,
};

// ================================
// 📞 Support API (if using help page)
// ================================
export const supportAPI = {
  sendMessage: async (formData) => (await api.post('/support', formData)).data,
};

export default {
  api,
  authAPI,
  restaurantAPI,
  orderAPI,
  supportAPI,
};
