/**
 * Comprehensive End-to-End tests for orders routes.
 *
 * This test mocks Order model DB operations so tests can run without a real DB.
 * It mounts the orders router on a temporary Express app and uses supertest to call endpoints.
 */
jest.setTimeout(10000);
const express = require('express');
const request = require('supertest');

// Mocks must be in place before the router is required.
jest.mock('../../models/Order');

const Order = require('../../models/Order');

describe('Orders Routes - End-to-End Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Load the orders router after mocks
    const ordersRouter = require('../../routes/orders');
    app.use('/api/orders', ordersRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/orders - Create Order', () => {
    test('should create order successfully', async () => {
      const orderData = {
        user: 'user123',
        restaurant: 'restaurant123',
        items: [
          { name: 'Pizza', price: 10, quantity: 2 },
          { name: 'Burger', price: 8, quantity: 1 }
        ],
        totalAmount: 28,
        deliveryAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      const createdOrder = {
        _id: 'order123',
        ...orderData,
        status: 'pending',
        paymentStatus: 'pending',
        populate: jest.fn().mockResolvedValue({
          _id: 'order123',
          ...orderData,
          user: { _id: 'user123', name: 'John Doe' },
          restaurant: { _id: 'restaurant123', name: 'Pizza Palace' }
        }),
        createdAt: new Date()
      };

      Order.create = jest.fn().mockResolvedValue(createdOrder);

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(Order.create).toHaveBeenCalledWith(orderData);
    });

    test('should return 400 if order creation fails', async () => {
      const orderData = {
        user: 'user123',
        restaurant: 'restaurant123',
        items: [],
        totalAmount: 0
      };

      Order.create = jest.fn().mockRejectedValue(new Error('Validation failed'));

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
    });

    test('should handle missing required fields', async () => {
      const orderData = {
        items: [],
        totalAmount: 0
      };

      Order.create = jest.fn().mockRejectedValue(new Error('Order validation failed: user: Path `user` is required.'));

      const res = await request(app)
        .post('/api/orders')
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/orders/user/:userId - Get User Orders', () => {
    test('should get user orders successfully', async () => {
      const userId = 'user123';
      const mockOrders = [
        {
          _id: 'order1',
          user: userId,
          restaurant: { _id: 'restaurant123', name: 'Pizza Palace' },
          items: [],
          totalAmount: 20,
          status: 'pending',
          createdAt: new Date('2024-01-02')
        },
        {
          _id: 'order2',
          user: userId,
          restaurant: { _id: 'restaurant456', name: 'Burger King' },
          items: [],
          totalAmount: 15,
          status: 'delivered',
          createdAt: new Date('2024-01-01')
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockOrders)
        })
      };
      Order.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/orders/user/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(Order.find).toHaveBeenCalledWith({ user: userId });
    });

    test('should return empty array if user has no orders', async () => {
      const userId = 'user999';

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      };
      Order.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/orders/user/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });

    test('should handle database errors', async () => {
      const userId = 'user123';

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('Database connection error'))
        })
      };
      Order.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/orders/user/${userId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });

  describe('GET /api/orders/restaurant/:restaurantId - Get Restaurant Orders', () => {
    test('should get restaurant orders successfully', async () => {
      const restaurantId = 'restaurant123';
      const mockOrders = [
        {
          _id: 'order1',
          user: { _id: 'user123', name: 'John Doe' },
          restaurant: restaurantId,
          items: [],
          totalAmount: 20,
          status: 'pending',
          createdAt: new Date('2024-01-02')
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockOrders)
        })
      };
      Order.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/orders/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(Order.find).toHaveBeenCalledWith({ restaurant: restaurantId });
    });

    test('should return empty array if restaurant has no orders', async () => {
      const restaurantId = 'restaurant999';

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      };
      Order.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/orders/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('PATCH /api/orders/:id/status - Update Order Status', () => {
    test('should update order status successfully', async () => {
      const orderId = 'order123';
      const statusUpdate = { status: 'confirmed' };

      const updatedOrder = {
        _id: orderId,
        user: { _id: 'user123', name: 'John Doe' },
        restaurant: { _id: 'restaurant123', name: 'Pizza Palace' },
        items: [],
        totalAmount: 20,
        status: 'confirmed',
        paymentStatus: 'pending'
      };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(updatedOrder)
      };
      Order.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send(statusUpdate);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('confirmed');
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        orderId,
        { status: 'confirmed' },
        { new: true }
      );
    });

    test('should return 404 if order not found', async () => {
      const orderId = 'order999';
      const statusUpdate = { status: 'confirmed' };

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null)
      };
      Order.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send(statusUpdate);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Order not found');
    });

    test('should handle invalid status update', async () => {
      const orderId = 'order123';
      const statusUpdate = { status: 'invalid-status' };

      const mockQuery = {
        populate: jest.fn().mockRejectedValue(new Error('Invalid status'))
      };
      Order.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send(statusUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid status');
    });

    test('should handle database errors', async () => {
      const orderId = 'order123';
      const statusUpdate = { status: 'confirmed' };

      const mockQuery = {
        populate: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };
      Order.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send(statusUpdate);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });
});

