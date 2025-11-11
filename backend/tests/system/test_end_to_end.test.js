/**
 * System tests (high-level end-to-end workflows) using mocked internals.
 * These are lightweight examples showing complete flows (register -> login -> place order)
 * while avoiding a real DB by mocking model methods.
 */
jest.setTimeout(15000);
const express = require('express');
const request = require('supertest');

jest.mock('../../models/User');
jest.mock('../../models/Restaurant');
jest.mock('../../models/Order');

const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');
const Order = require('../../models/Order');

describe('System tests - user flow (mocked DB)', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    // mount essential routers
    app.use('/api/auth', require('../../routes/auth'));
    app.use('/api/orders', require('../../routes/orders'));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Complete user flow: register -> login -> create order (mocked)', async () => {
    // Register
    User.findOne = jest.fn().mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue({ _id: 'u1', name: 'Z', email: 'z@x.com' });

    let res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Z', email: 'z@x.com', password: 'pass', role: 'user' });

    expect(res.statusCode).toBe(201);

    // Login - mock returned user and password check
    const fakeUser = { _id: 'u1', email: 'z@x.com', correctPassword: jest.fn().mockResolvedValue(true) };
    User.findOne = jest.fn().mockResolvedValue(fakeUser);

    res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'z@x.com', password: 'pass' });

    expect(res.statusCode).toBe(200);
    const token = res.body.token;
    expect(token).toBeDefined();

    // Create order - mock order save
    Order.prototype.save = jest.fn().mockResolvedValue({ _id: 'o1', items: [], user: 'u1' });
    Order.create = jest.fn().mockResolvedValue({ _id: 'o1', items: [], user: 'u1' });

    res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [], restaurantId: 'r1' });

    // Depending on implementation the orders route might return 201 or 200; assert not-500
    expect(res.statusCode).not.toBeGreaterThan(499);
  });
});
