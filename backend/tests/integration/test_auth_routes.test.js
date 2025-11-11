/**
 * Comprehensive End-to-End tests for authentication routes.
 *
 * This test mocks User and Restaurant model DB operations so tests can run without a real DB.
 * It mounts the auth router on a temporary Express app and uses supertest to call endpoints.
 */
jest.setTimeout(10000);
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mocks must be in place before the router is required.
jest.mock('../../models/User');
jest.mock('../../models/Restaurant');

const User = require('../../models/User');
const Restaurant = require('../../models/Restaurant');

// Set JWT_SECRET for token generation
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';

describe('Auth Routes - End-to-End Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Load the auth router after mocks
    const authRouter = require('../../routes/auth');
    app.use('/api/auth', authRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('User Registration - POST /api/auth/user/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '1234567890'
      };

      // Mock no existing user
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock User.create to return created user
      const createdUser = {
        _id: 'user123',
        name: userData.name,
        email: userData.email,
        phone: userData.phone
      };
      User.create = jest.fn().mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('role', 'user');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id', 'user123');
      expect(res.body.data.user).toHaveProperty('name', userData.name);
      expect(res.body.data.user).toHaveProperty('email', userData.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      
      // Verify token is valid
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user123');
      expect(decoded.role).toBe('user');
      
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalled();
    });

    test('should register user without phone number', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      const createdUser = {
        _id: 'user456',
        name: userData.name,
        email: userData.email
      };
      User.create = jest.fn().mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe(userData.email);
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock existing user
      const existingUser = {
        _id: 'existing123',
        email: userData.email
      };
      User.findOne = jest.fn().mockResolvedValue(existingUser);

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).not.toHaveBeenCalled();
    });

    test('should return 400 if name is missing', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockRejectedValue(new Error('User validation failed: name: Path `name` is required.'));

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if email is missing', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockRejectedValue(new Error('User validation failed: email: Path `email` is required.'));

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if password is missing', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockRejectedValue(new Error('User validation failed: password: Path `password` is required.'));

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should handle database errors during registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });

  describe('User Login - POST /api/auth/user/login', () => {
    test('should login user with correct credentials', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user789',
        name: 'Test User',
        email: loginData.email,
        password: 'hashedPassword',
        correctPassword: jest.fn().mockResolvedValue(true)
      };

      // Mock the chain: User.findOne().select('+password')
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/user/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('role', 'user');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id', 'user789');
      expect(res.body.data.user).toHaveProperty('name', 'Test User');
      expect(res.body.data.user).toHaveProperty('email', loginData.email);
      expect(res.body.data.user).not.toHaveProperty('password');

      // Verify token
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('user789');
      expect(decoded.role).toBe('user');

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
      expect(mockUser.correctPassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    test('should return 400 if email is missing', async () => {
      const loginData = {
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/user/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide email and password');
      expect(User.findOne).not.toHaveBeenCalled();
    });

    test('should return 400 if password is missing', async () => {
      const loginData = {
        email: 'user@example.com'
      };

      const res = await request(app)
        .post('/api/auth/user/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide email and password');
      expect(User.findOne).not.toHaveBeenCalled();
    });

    test('should return 401 if user does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock the chain: User.findOne().select('+password') returns null
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      User.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/user/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Incorrect email or password');
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
    });

    test('should return 401 if password is incorrect', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'user999',
        email: loginData.email,
        password: 'hashedPassword',
        correctPassword: jest.fn().mockResolvedValue(false)
      };

      // Mock the chain: User.findOne().select('+password')
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockUser)
      };
      User.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/user/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Incorrect email or password');
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
      expect(mockUser.correctPassword).toHaveBeenCalledWith(loginData.password, mockUser.password);
    });

    test('should handle database errors during login', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123'
      };

      // Mock the chain to throw an error
      const mockQuery = {
        select: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };
      User.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/user/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });

  describe('Restaurant Registration - POST /api/auth/restaurant/register', () => {
    test('should register a new restaurant successfully', async () => {
      const restaurantData = {
        name: 'Pizza Palace',
        email: 'pizza@example.com',
        password: 'restaurant123',
        phone: '9876543210',
        cuisine: ['Italian', 'Pizza'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      
      const createdRestaurant = {
        _id: 'restaurant123',
        name: restaurantData.name,
        email: restaurantData.email,
        phone: restaurantData.phone,
        cuisine: restaurantData.cuisine,
        address: restaurantData.address
      };
      Restaurant.create = jest.fn().mockResolvedValue(createdRestaurant);

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('role', 'restaurant');
      expect(res.body.data).toHaveProperty('restaurant');
      expect(res.body.data.restaurant).toHaveProperty('id', 'restaurant123');
      expect(res.body.data.restaurant).toHaveProperty('name', restaurantData.name);
      expect(res.body.data.restaurant).toHaveProperty('email', restaurantData.email);
      expect(res.body.data.restaurant).not.toHaveProperty('password');

      // Verify token
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('restaurant123');
      expect(decoded.role).toBe('restaurant');

      expect(Restaurant.findOne).toHaveBeenCalledWith({ email: restaurantData.email });
      expect(Restaurant.create).toHaveBeenCalled();
    });

    test('should register restaurant with minimal required fields', async () => {
      const restaurantData = {
        name: 'Burger King',
        email: 'burger@example.com',
        password: 'password123',
        cuisine: ['Fast Food'],
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      const createdRestaurant = {
        _id: 'restaurant456',
        name: restaurantData.name,
        email: restaurantData.email,
        cuisine: restaurantData.cuisine,
        address: restaurantData.address
      };
      Restaurant.create = jest.fn().mockResolvedValue(createdRestaurant);

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.restaurant.email).toBe(restaurantData.email);
    });

    test('should return 400 if restaurant already exists', async () => {
      const restaurantData = {
        name: 'Existing Restaurant',
        email: 'existing@example.com',
        password: 'password123',
        cuisine: ['Italian'],
        address: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601'
        }
      };

      const existingRestaurant = {
        _id: 'existing123',
        email: restaurantData.email
      };
      Restaurant.findOne = jest.fn().mockResolvedValue(existingRestaurant);

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Restaurant already exists');
      expect(Restaurant.findOne).toHaveBeenCalledWith({ email: restaurantData.email });
      expect(Restaurant.create).not.toHaveBeenCalled();
    });

    test('should return 400 if name is missing', async () => {
      const restaurantData = {
        email: 'test@example.com',
        password: 'password123',
        cuisine: ['Italian'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      Restaurant.create = jest.fn().mockRejectedValue(new Error('Restaurant validation failed: name: Path `name` is required.'));

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if email is missing', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        password: 'password123',
        cuisine: ['Italian'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      Restaurant.create = jest.fn().mockRejectedValue(new Error('Restaurant validation failed: email: Path `email` is required.'));

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if password is missing', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        email: 'test@example.com',
        cuisine: ['Italian'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      Restaurant.create = jest.fn().mockRejectedValue(new Error('Restaurant validation failed: password: Path `password` is required.'));

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should handle database errors during restaurant registration', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        email: 'test@example.com',
        password: 'password123',
        cuisine: ['Italian'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      Restaurant.create = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });

  describe('Restaurant Login - POST /api/auth/restaurant/login', () => {
    test('should login restaurant with correct credentials', async () => {
      const loginData = {
        email: 'restaurant@example.com',
        password: 'password123'
      };

      const mockRestaurant = {
        _id: 'restaurant789',
        name: 'Test Restaurant',
        email: loginData.email,
        password: 'hashedPassword',
        correctPassword: jest.fn().mockResolvedValue(true)
      };

      // Mock the chain: Restaurant.findOne().select('+password')
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRestaurant)
      };
      Restaurant.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/restaurant/login')
        .send(loginData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('role', 'restaurant');
      expect(res.body.data).toHaveProperty('restaurant');
      expect(res.body.data.restaurant).toHaveProperty('id', 'restaurant789');
      expect(res.body.data.restaurant).toHaveProperty('name', 'Test Restaurant');
      expect(res.body.data.restaurant).toHaveProperty('email', loginData.email);
      expect(res.body.data.restaurant).not.toHaveProperty('password');

      // Verify token
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('restaurant789');
      expect(decoded.role).toBe('restaurant');

      expect(Restaurant.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
      expect(mockRestaurant.correctPassword).toHaveBeenCalledWith(loginData.password, mockRestaurant.password);
    });

    test('should return 400 if email is missing', async () => {
      const loginData = {
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/auth/restaurant/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide email and password');
      expect(Restaurant.findOne).not.toHaveBeenCalled();
    });

    test('should return 400 if password is missing', async () => {
      const loginData = {
        email: 'restaurant@example.com'
      };

      const res = await request(app)
        .post('/api/auth/restaurant/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Please provide email and password');
      expect(Restaurant.findOne).not.toHaveBeenCalled();
    });

    test('should return 401 if restaurant does not exist', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock the chain: Restaurant.findOne().select('+password') returns null
      const mockQuery = {
        select: jest.fn().mockResolvedValue(null)
      };
      Restaurant.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/restaurant/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Incorrect email or password');
      expect(Restaurant.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
    });

    test('should return 401 if password is incorrect', async () => {
      const loginData = {
        email: 'restaurant@example.com',
        password: 'wrongpassword'
      };

      const mockRestaurant = {
        _id: 'restaurant999',
        email: loginData.email,
        password: 'hashedPassword',
        correctPassword: jest.fn().mockResolvedValue(false)
      };

      // Mock the chain: Restaurant.findOne().select('+password')
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockRestaurant)
      };
      Restaurant.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/restaurant/login')
        .send(loginData);

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Incorrect email or password');
      expect(mockQuery.select).toHaveBeenCalledWith('+password');
      expect(mockRestaurant.correctPassword).toHaveBeenCalledWith(loginData.password, mockRestaurant.password);
    });

    test('should handle database errors during restaurant login', async () => {
      const loginData = {
        email: 'restaurant@example.com',
        password: 'password123'
      };

      // Mock the chain to throw an error
      const mockQuery = {
        select: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };
      Restaurant.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .post('/api/auth/restaurant/login')
        .send(loginData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });
  });

  describe('Edge Cases and Security', () => {
    test('should not expose password in user registration response', async () => {
      const userData = {
        name: 'Secure User',
        email: 'secure@example.com',
        password: 'secretpassword'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      const createdUser = {
        _id: 'secure123',
        name: userData.name,
        email: userData.email
      };
      User.create = jest.fn().mockResolvedValue(createdUser);

      const res = await request(app)
        .post('/api/auth/user/register')
        .send(userData);

      expect(res.statusCode).toBe(201);
      expect(JSON.stringify(res.body)).not.toContain('secretpassword');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    test('should not expose password in restaurant registration response', async () => {
      const restaurantData = {
        name: 'Secure Restaurant',
        email: 'secure@example.com',
        password: 'secretpassword',
        cuisine: ['Italian'],
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        }
      };

      Restaurant.findOne = jest.fn().mockResolvedValue(null);
      const createdRestaurant = {
        _id: 'secure456',
        name: restaurantData.name,
        email: restaurantData.email
      };
      Restaurant.create = jest.fn().mockResolvedValue(createdRestaurant);

      const res = await request(app)
        .post('/api/auth/restaurant/register')
        .send(restaurantData);

      expect(res.statusCode).toBe(201);
      expect(JSON.stringify(res.body)).not.toContain('secretpassword');
      expect(res.body.data.restaurant).not.toHaveProperty('password');
    });

    test('should handle empty request body gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/user/register')
        .send({});

      expect(res.statusCode).toBe(400);
    });

    test('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/user/login')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Express should handle this, might return 400 or 500
      expect([400, 500]).toContain(res.statusCode);
    });

    test('should generate different tokens for different users', async () => {
      // Register first user
      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn()
        .mockResolvedValueOnce({ _id: 'user1', name: 'User 1', email: 'user1@example.com' })
        .mockResolvedValueOnce({ _id: 'user2', name: 'User 2', email: 'user2@example.com' });

      const res1 = await request(app)
        .post('/api/auth/user/register')
        .send({ name: 'User 1', email: 'user1@example.com', password: 'password123' });

      const res2 = await request(app)
        .post('/api/auth/user/register')
        .send({ name: 'User 2', email: 'user2@example.com', password: 'password123' });

      expect(res1.statusCode).toBe(201);
      expect(res2.statusCode).toBe(201);
      expect(res1.body.token).not.toBe(res2.body.token);

      const decoded1 = jwt.verify(res1.body.token, process.env.JWT_SECRET);
      const decoded2 = jwt.verify(res2.body.token, process.env.JWT_SECRET);
      expect(decoded1.id).toBe('user1');
      expect(decoded2.id).toBe('user2');
    });
  });
});
