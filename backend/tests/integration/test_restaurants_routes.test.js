/**
 * Comprehensive End-to-End tests for restaurants routes.
 *
 * This test mocks Restaurant model DB operations so tests can run without a real DB.
 * It mounts the restaurants router on a temporary Express app and uses supertest to call endpoints.
 */
jest.setTimeout(10000);
const express = require('express');
const request = require('supertest');

// Mocks must be in place before the router is required.
jest.mock('../../models/Restaurant');

const Restaurant = require('../../models/Restaurant');

describe('Restaurants Routes - End-to-End Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Load the restaurants router after mocks
    const restaurantsRouter = require('../../routes/restaurants');
    app.use('/api/restaurants', restaurantsRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/restaurants - Get All Restaurants', () => {
    test('should get all active restaurants successfully', async () => {
      const mockRestaurants = [
        {
          _id: 'restaurant1',
          name: 'Pizza Palace',
          email: 'pizza@example.com',
          cuisine: ['Italian'],
          isActive: true
        },
        {
          _id: 'restaurant2',
          name: 'Burger King',
          email: 'burger@example.com',
          cuisine: ['Fast Food'],
          isActive: true
        }
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRestaurants)
      };
      Restaurant.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/restaurants');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(Restaurant.find).toHaveBeenCalledWith({ isActive: true });
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('should return empty array if no active restaurants', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      Restaurant.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/restaurants');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    test('should handle database errors', async () => {
      const mockQuery = {
        select: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };
      Restaurant.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/restaurants');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });

  describe('GET /api/restaurants/search/:query - Search Restaurants', () => {
    test('should search restaurants by name', async () => {
      const query = 'pizza';
      const mockRestaurants = [
        {
          _id: 'restaurant1',
          name: 'Pizza Palace',
          cuisine: ['Italian']
        }
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRestaurants)
      };
      Restaurant.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/restaurants/search/${query}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(Restaurant.find).toHaveBeenCalled();
    });

    test('should search restaurants by cuisine', async () => {
      const query = 'italian';
      const mockRestaurants = [
        {
          _id: 'restaurant1',
          name: 'Pizza Palace',
          cuisine: ['Italian']
        }
      ];

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRestaurants)
      };
      Restaurant.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/restaurants/search/${query}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    test('should return empty array if no matches', async () => {
      const query = 'nonexistent';

      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      Restaurant.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/restaurants/search/${query}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/restaurants/:id - Get Single Restaurant', () => {
    test('should get restaurant by id successfully', async () => {
      const restaurantId = 'restaurant123';
      const mockRestaurant = {
        _id: restaurantId,
        name: 'Pizza Palace',
        email: 'pizza@example.com',
        cuisine: ['Italian'],
        menu: []
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRestaurant)
      };
      Restaurant.findById = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/restaurants/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', restaurantId);
      expect(res.body).toHaveProperty('name', 'Pizza Palace');
      expect(Restaurant.findById).toHaveBeenCalledWith(restaurantId);
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
    });

    test('should return 404 if restaurant not found', async () => {
      const restaurantId = 'restaurant999';

      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      Restaurant.findById = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/restaurants/${restaurantId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });

  describe('PUT /api/restaurants/:id - Update Restaurant', () => {
    test('should update restaurant successfully', async () => {
      const restaurantId = 'restaurant123';
      const updateData = {
        name: 'Updated Pizza Palace',
        cuisine: ['Italian', 'Pizza']
      };

      const updatedRestaurant = {
        _id: restaurantId,
        ...updateData,
        email: 'pizza@example.com'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(updatedRestaurant)
      };
      Restaurant.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Pizza Palace');
      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        restaurantId,
        updateData,
        { new: true, runValidators: true }
      );
    });

    test('should not allow password or email update', async () => {
      const restaurantId = 'restaurant123';
      const updateData = {
        name: 'Updated Name',
        password: 'newpassword',
        email: 'newemail@example.com'
      };

      const updatedRestaurant = {
        _id: restaurantId,
        name: 'Updated Name',
        email: 'pizza@example.com' // Original email preserved
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(updatedRestaurant)
      };
      Restaurant.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      // Password and email should not be in updateData passed to findByIdAndUpdate
      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        restaurantId,
        { name: 'Updated Name' },
        { new: true, runValidators: true }
      );
    });

    test('should return 404 if restaurant not found', async () => {
      const restaurantId = 'restaurant999';

      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      Restaurant.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}`)
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });

  describe('POST /api/restaurants/:id/menu - Add Menu Item', () => {
    test('should add menu item successfully', async () => {
      const restaurantId = 'restaurant123';
      const menuItem = {
        name: 'Margherita Pizza',
        description: 'Classic pizza',
        price: 12,
        category: 'Pizza',
        available: true
      };

      const mockRestaurant = {
        _id: restaurantId,
        name: 'Pizza Palace',
        menu: [],
        save: jest.fn().mockResolvedValue({
          _id: restaurantId,
          menu: [{
            _id: 'menuItem123',
            ...menuItem
          }]
        })
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .post(`/api/restaurants/${restaurantId}/menu`)
        .send(menuItem);

      expect(res.statusCode).toBe(201);
      expect(Restaurant.findById).toHaveBeenCalledWith(restaurantId);
      expect(mockRestaurant.save).toHaveBeenCalled();
    });

    test('should return 404 if restaurant not found', async () => {
      const restaurantId = 'restaurant999';

      Restaurant.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .post(`/api/restaurants/${restaurantId}/menu`)
        .send({ name: 'Pizza', price: 10 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });

  describe('PUT /api/restaurants/:id/menu/:menuItemId - Update Menu Item', () => {
    test('should update menu item successfully', async () => {
      const restaurantId = 'restaurant123';
      const menuItemId = 'menuItem123';
      const updateData = { price: 15, available: false };

      const mockMenuItem = {
        _id: menuItemId,
        name: 'Pizza',
        price: 10,
        available: true
      };

      const mockRestaurant = {
        _id: restaurantId,
        menu: {
          id: jest.fn().mockReturnValue(mockMenuItem)
        },
        save: jest.fn().mockResolvedValue({})
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}/menu/${menuItemId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(mockRestaurant.menu.id).toHaveBeenCalledWith(menuItemId);
      expect(mockRestaurant.save).toHaveBeenCalled();
    });

    test('should return 404 if restaurant not found', async () => {
      const restaurantId = 'restaurant999';
      const menuItemId = 'menuItem123';

      Restaurant.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}/menu/${menuItemId}`)
        .send({ price: 15 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });

    test('should return 404 if menu item not found', async () => {
      const restaurantId = 'restaurant123';
      const menuItemId = 'menuItem999';

      const mockRestaurant = {
        _id: restaurantId,
        menu: {
          id: jest.fn().mockReturnValue(null)
        }
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .put(`/api/restaurants/${restaurantId}/menu/${menuItemId}`)
        .send({ price: 15 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Menu item not found');
    });
  });

  describe('DELETE /api/restaurants/:id/menu/:menuItemId - Delete Menu Item', () => {
    test('should delete menu item successfully', async () => {
      const restaurantId = 'restaurant123';
      const menuItemId = 'menuItem123';

      const mockRestaurant = {
        _id: restaurantId,
        menu: {
          pull: jest.fn()
        },
        save: jest.fn().mockResolvedValue({})
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .delete(`/api/restaurants/${restaurantId}/menu/${menuItemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Menu item deleted successfully');
      expect(mockRestaurant.menu.pull).toHaveBeenCalledWith(menuItemId);
      expect(mockRestaurant.save).toHaveBeenCalled();
    });

    test('should return 404 if restaurant not found', async () => {
      const restaurantId = 'restaurant999';
      const menuItemId = 'menuItem123';

      Restaurant.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .delete(`/api/restaurants/${restaurantId}/menu/${menuItemId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });
});

