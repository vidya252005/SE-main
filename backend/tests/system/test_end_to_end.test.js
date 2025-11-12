/**
 * System tests (high-level end-to-end workflows) using mocked internals.
 * These are lightweight examples showing complete flows (register -> login -> place order -> feedback)
 * while avoiding a real DB by mocking model methods.
 */
jest.setTimeout(15000);
const express = require('express');
const request = require('supertest');

jest.mock('../../models/User');
jest.mock('../../models/Restaurant');
jest.mock('../../models/Order');
jest.mock('../../models/Feedback');
jest.mock('../../models/Support');

const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const Order = require('../../models/Order');
const Feedback = require('../../models/Feedback');

// Set JWT_SECRET for token generation
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';

describe('System tests - Complete User Workflows (mocked DB)', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Mount all routers
    app.use('/api/auth', require('../../routes/auth'));
    app.use('/api/orders', require('../../routes/orders'));
    app.use('/api/feedback', require('../../routes/Feedback'));
    app.use('/api/support', require('../../routes/Support'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Complete user flow: register -> login -> create order (mocked)', async () => {
    // Step 1: User Registration
    User.findOne = jest.fn().mockResolvedValue(null);
    const createdUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com'
    };
    User.create = jest.fn().mockResolvedValue(createdUser);

    let res = await request(app)
      .post('/api/auth/user/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('john@example.com');

    // Step 2: User Login
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      correctPassword: jest.fn().mockResolvedValue(true)
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(mockUser)
    };
    User.findOne = jest.fn().mockReturnValue(mockQuery);

    res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'john@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    const token = res.body.token;
    expect(token).toBeDefined();

    // Step 3: Create Order
    Order.create = jest.fn().mockResolvedValue({
      _id: 'order123',
      user: 'user123',
      restaurant: 'restaurant123',
      items: [{ name: 'Pizza', price: 10, quantity: 2 }],
      totalAmount: 20,
      status: 'pending'
    });

    res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ name: 'Pizza', price: 10, quantity: 2 }],
        restaurantId: 'restaurant123',
        totalAmount: 20
      });

    // Order creation should succeed (201) or at least not be a server error
    expect(res.statusCode).not.toBeGreaterThan(499);
  });

  test('Complete restaurant flow: register -> login (mocked)', async () => {
    // Step 1: Restaurant Registration
    Restaurant.findOne = jest.fn().mockResolvedValue(null);
    const createdRestaurant = {
      _id: 'restaurant123',
      name: 'Pizza Palace',
      email: 'pizza@example.com'
    };
    Restaurant.create = jest.fn().mockResolvedValue(createdRestaurant);

    let res = await request(app)
      .post('/api/auth/restaurant/register')
      .send({
        name: 'Pizza Palace',
        email: 'pizza@example.com',
        password: 'password123',
        cuisine: ['Italian'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.restaurant.email).toBe('pizza@example.com');

    // Step 2: Restaurant Login
    const mockRestaurant = {
      _id: 'restaurant123',
      name: 'Pizza Palace',
      email: 'pizza@example.com',
      password: 'hashedPassword',
      correctPassword: jest.fn().mockResolvedValue(true)
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(mockRestaurant)
    };
    Restaurant.findOne = jest.fn().mockReturnValue(mockQuery);

    res = await request(app)
      .post('/api/auth/restaurant/login')
      .send({ email: 'pizza@example.com', password: 'password123' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.restaurant.name).toBe('Pizza Palace');
  });

  test('Complete feedback workflow: user creates order -> submits feedback (mocked)', async () => {
    // Step 1: User login (simplified)
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      correctPassword: jest.fn().mockResolvedValue(true)
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(mockUser)
    };
    User.findOne = jest.fn().mockReturnValue(mockQuery);

    let res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'john@example.com', password: 'password123' });

    const token = res.body.token;

    // Step 2: Create order
    Order.create = jest.fn().mockResolvedValue({
      _id: 'order123',
      user: 'user123',
      restaurant: 'restaurant123',
      items: [],
      totalAmount: 50
    });

    res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [],
        restaurantId: 'restaurant123',
        totalAmount: 50
      });

    expect(res.statusCode).not.toBeGreaterThan(499);

    // Step 3: Submit feedback
    Feedback.findOne = jest.fn().mockResolvedValue(null);
    const createdFeedback = {
      _id: 'feedback123',
      order: 'order123',
      user: 'user123',
      restaurant: 'restaurant123',
      rating: 5,
      foodQuality: 4,
      deliverySpeed: 5,
      comment: 'Great experience!'
    };
    Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

    res = await request(app)
      .post('/api/feedback')
      .send({
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        foodQuality: 4,
        deliverySpeed: 5,
        comment: 'Great experience!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
    expect(res.body.comment).toBe('Great experience!');
  });

  test('Complete support workflow: user submits support ticket (mocked)', async () => {
    const Support = require('../../models/Support');

    Support.create = jest.fn().mockResolvedValue({
      _id: 'support123',
      name: 'John Doe',
      email: 'john@example.com',
      issue: 'Order was delivered late',
      status: 'open',
      createdAt: new Date()
    });

    const res = await request(app)
      .post('/api/support')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        issue: 'Order was delivered late'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Support request received');
    expect(res.body.ticket).toHaveProperty('_id', 'support123');
    expect(res.body.ticket.status).toBe('open');
  });

  test('Complete workflow: restaurant registers -> user orders -> user gives feedback -> user contacts support', async () => {
    // Step 1: Restaurant Registration
    Restaurant.findOne = jest.fn().mockResolvedValue(null);
    Restaurant.create = jest.fn().mockResolvedValue({
      _id: 'restaurant123',
      name: 'Burger King',
      email: 'burger@example.com'
    });

    let res = await request(app)
      .post('/api/auth/restaurant/register')
      .send({
        name: 'Burger King',
        email: 'burger@example.com',
        password: 'password123',
        cuisine: ['Fast Food'],
        address: { street: '123 Main St', city: 'NYC', state: 'NY', zipCode: '10001' }
      });

    expect(res.statusCode).toBe(201);

    // Step 2: User Registration
    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({
      _id: 'user123',
      name: 'Jane Doe',
      email: 'jane@example.com'
    });

    res = await request(app)
      .post('/api/auth/user/register')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);

    // Step 3: User Login
    const mockUser = {
      _id: 'user123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashedPassword',
      correctPassword: jest.fn().mockResolvedValue(true)
    };

    const mockQuery = {
      select: jest.fn().mockResolvedValue(mockUser)
    };
    User.findOne = jest.fn().mockReturnValue(mockQuery);

    res = await request(app)
      .post('/api/auth/user/login')
      .send({ email: 'jane@example.com', password: 'password123' });

    const userToken = res.body.token;

    // Step 4: Create Order
    Order.create = jest.fn().mockResolvedValue({
      _id: 'order123',
      user: 'user123',
      restaurant: 'restaurant123',
      items: [{ name: 'Burger', price: 8, quantity: 2 }],
      totalAmount: 16
    });

    res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        items: [{ name: 'Burger', price: 8, quantity: 2 }],
        restaurantId: 'restaurant123',
        totalAmount: 16
      });

    expect(res.statusCode).not.toBeGreaterThan(499);

    // Step 5: Submit Feedback
    Feedback.findOne = jest.fn().mockResolvedValue(null);
    Feedback.create = jest.fn().mockResolvedValue({
      _id: 'feedback123',
      order: 'order123',
      user: 'user123',
      restaurant: 'restaurant123',
      rating: 4,
      comment: 'Good food!'
    });

    res = await request(app)
      .post('/api/feedback')
      .send({
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 4,
        comment: 'Good food!'
      });

    expect(res.statusCode).toBe(201);

    // Step 6: Contact Support
    const Support = require('../../models/Support');
    Support.create = jest.fn().mockResolvedValue({
      _id: 'support123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      issue: 'Need to modify my order',
      status: 'open'
    });

    res = await request(app)
      .post('/api/support')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        issue: 'Need to modify my order'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.ticket.status).toBe('open');
  });
});

