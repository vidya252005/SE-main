/**
 * Comprehensive End-to-End tests for restaurant routes (authenticated routes).
 *
 * This test mocks Restaurant model and auth middleware so tests can run without a real DB.
 * It mounts the restaurant router on a temporary Express app and uses supertest to call endpoints.
 */
jest.setTimeout(10000);
const express = require('express');
const request = require('supertest');

// Mocks must be in place before the router is required.
jest.mock('../../models/Restaurant');
jest.mock('../../models/Order');
jest.mock('../../middleware/auth');

const Restaurant = require('../../models/Restaurant');
const Order = require('../../models/Order');
const { authenticateRestaurant } = require('../../middleware/auth');

// Mock the middleware to always call next() and set req.restaurantId
authenticateRestaurant.mockImplementation((req, res, next) => {
  req.restaurantId = 'restaurant123';
  req.restaurant = { _id: 'restaurant123', name: 'Test Restaurant' };
  next();
});

describe('Restaurant Routes (Authenticated) - End-to-End Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Load the restaurant router after mocks
    const restaurantRouter = require('../../routes/restaurantRoutes');
    app.use('/api/restaurant', restaurantRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/restaurant/menu - Get Restaurant Menu', () => {
    test('should get restaurant menu successfully', async () => {
      const mockRestaurant = {
        _id: 'restaurant123',
        name: 'Pizza Palace',
        menu: [
          { _id: 'menu1', name: 'Pizza', price: 10 },
          { _id: 'menu2', name: 'Burger', price: 8 }
        ]
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .get('/api/restaurant/menu');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(Restaurant.findById).toHaveBeenCalledWith('restaurant123');
    });

    test('should return 404 if restaurant not found', async () => {
      Restaurant.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .get('/api/restaurant/menu');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });

  describe('POST /api/restaurant/menu - Add Menu Item', () => {
    test('should add menu item successfully', async () => {
      const menuItem = {
        name: 'New Pizza',
        description: 'Delicious pizza',
        price: 12,
        category: 'Pizza',
        available: true
      };

      const mockRestaurant = {
        _id: 'restaurant123',
        menu: [],
        save: jest.fn().mockResolvedValue({
          _id: 'restaurant123',
          menu: [{
            _id: 'menuItem123',
            ...menuItem
          }]
        })
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .post('/api/restaurant/menu')
        .send(menuItem);

      expect(res.statusCode).toBe(201);
      expect(mockRestaurant.save).toHaveBeenCalled();
    });

    test('should return 404 if restaurant not found', async () => {
      Restaurant.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .post('/api/restaurant/menu')
        .send({ name: 'Pizza', price: 10 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });

  describe('PUT /api/restaurant/menu/:menuItemId - Update Menu Item', () => {
    test('should update menu item successfully', async () => {
      const menuItemId = 'menuItem123';
      const updateData = { price: 15, available: false };

      const mockMenuItem = {
        _id: menuItemId,
        name: 'Pizza',
        price: 10,
        available: true
      };

      const mockRestaurant = {
        _id: 'restaurant123',
        menu: {
          id: jest.fn().mockReturnValue(mockMenuItem)
        },
        save: jest.fn().mockResolvedValue({})
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .put(`/api/restaurant/menu/${menuItemId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(mockRestaurant.menu.id).toHaveBeenCalledWith(menuItemId);
      expect(mockRestaurant.save).toHaveBeenCalled();
    });

    test('should return 404 if menu item not found', async () => {
      const menuItemId = 'menuItem999';

      const mockRestaurant = {
        _id: 'restaurant123',
        menu: {
          id: jest.fn().mockReturnValue(null)
        }
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .put(`/api/restaurant/menu/${menuItemId}`)
        .send({ price: 15 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Menu item not found');
    });
  });

  describe('DELETE /api/restaurant/menu/:menuItemId - Delete Menu Item', () => {
    test('should delete menu item successfully', async () => {
      const menuItemId = 'menuItem123';

      const mockRestaurant = {
        _id: 'restaurant123',
        menu: {
          pull: jest.fn()
        },
        save: jest.fn().mockResolvedValue({})
      };

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);

      const res = await request(app)
        .delete(`/api/restaurant/menu/${menuItemId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Menu item deleted successfully');
      expect(mockRestaurant.menu.pull).toHaveBeenCalledWith(menuItemId);
    });
  });

  describe('GET /api/restaurant/stats - Get Restaurant Stats', () => {
    test('should get restaurant stats successfully', async () => {
      const mockRestaurant = {
        _id: 'restaurant123',
        name: 'Pizza Palace',
        menu: [
          { _id: 'menu1', name: 'Pizza' },
          { _id: 'menu2', name: 'Burger' }
        ]
      };

      const mockOrders = [
        {
          _id: 'order1',
          restaurant: 'restaurant123',
          totalAmount: 20,
          status: 'pending',
          createdAt: new Date()
        },
        {
          _id: 'order2',
          restaurant: 'restaurant123',
          totalAmount: 15,
          status: 'delivered',
          createdAt: new Date()
        }
      ];

      Restaurant.findById = jest.fn().mockResolvedValue(mockRestaurant);
      Order.find = jest.fn().mockResolvedValue(mockOrders);

      const res = await request(app)
        .get('/api/restaurant/stats');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalOrders', 2);
      expect(res.body).toHaveProperty('totalMenuItems', 2);
      expect(res.body).toHaveProperty('pendingOrders');
      expect(res.body).toHaveProperty('todayRevenue');
    });

    test('should return 404 if restaurant not found', async () => {
      Restaurant.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app)
        .get('/api/restaurant/stats');

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Restaurant not found');
    });
  });

  describe('GET /api/restaurant/orders - Get Restaurant Orders', () => {
    test('should get restaurant orders (placeholder)', async () => {
      const res = await request(app)
        .get('/api/restaurant/orders');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('PUT /api/restaurant/profile - Update Restaurant Profile', () => {
    test('should update restaurant profile successfully', async () => {
      const updateData = {
        name: 'Updated Restaurant Name',
        cuisine: ['Italian', 'Pizza']
      };

      const updatedRestaurant = {
        _id: 'restaurant123',
        ...updateData,
        email: 'restaurant@example.com'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(updatedRestaurant)
      };
      Restaurant.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .put('/api/restaurant/profile')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Restaurant Name');
      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        'restaurant123',
        updateData,
        { new: true, runValidators: true }
      );
    });

    test('should not allow password or email update', async () => {
      const updateData = {
        name: 'Updated Name',
        password: 'newpassword',
        email: 'newemail@example.com'
      };

      const updatedRestaurant = {
        _id: 'restaurant123',
        name: 'Updated Name',
        email: 'restaurant@example.com'
      };

      const mockQuery = {
        select: jest.fn().mockResolvedValue(updatedRestaurant)
      };
      Restaurant.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .put('/api/restaurant/profile')
        .send(updateData);

      expect(res.statusCode).toBe(200);
      // Password and email should be filtered out
      expect(Restaurant.findByIdAndUpdate).toHaveBeenCalledWith(
        'restaurant123',
        { name: 'Updated Name' },
        { new: true, runValidators: true }
      );
    });
  });
});

