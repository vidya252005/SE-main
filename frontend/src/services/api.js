import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5001/api', 
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true, // enable only if you use cookies
});

// Attach the *restaurant* token for protected routes (if needed)
api.interceptors.request.use((req) => {
  const token = localStorage.getItem('restaurantToken'); // ✅ match your context storage key
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

getStats: () =>
  apiCall(`/restaurant/stats`, {
    restaurantAuth: true,
  }),

// Auth helpers
export const authAPI = {
  // Adjust path to match your backend route
  restaurantLogin: async ({ email, password }) => {
    const res = await api.post('/auth/restaurant/login', { email, password });
    return res.data; // expect { status, token, data: { restaurant } } (or similar)
  },
};

export default api;
