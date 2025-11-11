import API from './api';

export const userRegister = (userData) => API.post('/auth/user/register', userData);
export const userLogin = (loginData) => API.post('/auth/user/login', loginData);
export const restaurantRegister = (restaurantData) => API.post('/auth/restaurant/register', restaurantData);
export const RestaurantLogin = (loginData) => API.post('/auth/restaurant/login', loginData);