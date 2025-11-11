/**
 * Comprehensive End-to-End tests for feedback routes.
 *
 * This test mocks Feedback and Order model DB operations so tests can run without a real DB.
 * It mounts the feedback router on a temporary Express app and uses supertest to call endpoints.
 */
jest.setTimeout(10000);
const express = require('express');
const request = require('supertest');

// Mocks must be in place before the router is required.
jest.mock('../../models/Feedback');
jest.mock('../../models/Order');

const Feedback = require('../../models/Feedback');
const Order = require('../../models/Order');

describe('Feedback Routes - End-to-End Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Load the feedback router after mocks
    const feedbackRouter = require('../../routes/Feedback');
    app.use('/api/feedback', feedbackRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/feedback - Create Feedback', () => {
    test('should create feedback successfully with all fields', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        foodQuality: 4,
        deliverySpeed: 5,
        comment: 'Great food and fast delivery!'
      };

      // Mock no existing feedback
      Feedback.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock Feedback.create to return created feedback
      const createdFeedback = {
        _id: 'feedback123',
        order: feedbackData.orderId,
        user: feedbackData.userId,
        restaurant: feedbackData.restaurantId,
        rating: feedbackData.rating,
        foodQuality: feedbackData.foodQuality,
        deliverySpeed: feedbackData.deliverySpeed,
        comment: feedbackData.comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id', 'feedback123');
      expect(res.body).toHaveProperty('order', feedbackData.orderId);
      expect(res.body).toHaveProperty('user', feedbackData.userId);
      expect(res.body).toHaveProperty('restaurant', feedbackData.restaurantId);
      expect(res.body).toHaveProperty('rating', feedbackData.rating);
      expect(res.body).toHaveProperty('foodQuality', feedbackData.foodQuality);
      expect(res.body).toHaveProperty('deliverySpeed', feedbackData.deliverySpeed);
      expect(res.body).toHaveProperty('comment', feedbackData.comment);
      
      expect(Feedback.findOne).toHaveBeenCalledWith({ order: feedbackData.orderId });
      expect(Feedback.create).toHaveBeenCalledWith({
        order: feedbackData.orderId,
        user: feedbackData.userId,
        restaurant: feedbackData.restaurantId,
        rating: feedbackData.rating,
        foodQuality: feedbackData.foodQuality,
        deliverySpeed: feedbackData.deliverySpeed,
        comment: feedbackData.comment
      });
    });

    test('should create feedback with only required fields (rating)', async () => {
      const feedbackData = {
        orderId: 'order456',
        userId: 'user456',
        restaurantId: 'restaurant456',
        rating: 4
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      
      const createdFeedback = {
        _id: 'feedback456',
        order: feedbackData.orderId,
        user: feedbackData.userId,
        restaurant: feedbackData.restaurantId,
        rating: feedbackData.rating,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('rating', feedbackData.rating);
      expect(res.body).toHaveProperty('order', feedbackData.orderId);
      expect(Feedback.create).toHaveBeenCalled();
    });

    test('should create feedback with optional fields only (foodQuality, deliverySpeed, comment)', async () => {
      const feedbackData = {
        orderId: 'order789',
        userId: 'user789',
        restaurantId: 'restaurant789',
        rating: 3,
        foodQuality: 3,
        deliverySpeed: 4,
        comment: 'Average experience'
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      
      const createdFeedback = {
        _id: 'feedback789',
        order: feedbackData.orderId,
        user: feedbackData.userId,
        restaurant: feedbackData.restaurantId,
        rating: feedbackData.rating,
        foodQuality: feedbackData.foodQuality,
        deliverySpeed: feedbackData.deliverySpeed,
        comment: feedbackData.comment,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(201);
      expect(res.body.foodQuality).toBe(feedbackData.foodQuality);
      expect(res.body.deliverySpeed).toBe(feedbackData.deliverySpeed);
      expect(res.body.comment).toBe(feedbackData.comment);
    });

    test('should return 400 if feedback already exists for the order', async () => {
      const feedbackData = {
        orderId: 'order999',
        userId: 'user999',
        restaurantId: 'restaurant999',
        rating: 5
      };

      const existingFeedback = {
        _id: 'existingFeedback123',
        order: feedbackData.orderId,
        user: feedbackData.userId,
        restaurant: feedbackData.restaurantId,
        rating: 4
      };
      Feedback.findOne = jest.fn().mockResolvedValue(existingFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Feedback already submitted for this order');
      expect(Feedback.findOne).toHaveBeenCalledWith({ order: feedbackData.orderId });
      expect(Feedback.create).not.toHaveBeenCalled();
    });

    test('should return 400 if orderId is missing', async () => {
      const feedbackData = {
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: order: Path `order` is required.'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if userId is missing', async () => {
      const feedbackData = {
        orderId: 'order123',
        restaurantId: 'restaurant123',
        rating: 5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: user: Path `user` is required.'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if restaurantId is missing', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        rating: 5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: restaurant: Path `restaurant` is required.'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if rating is missing', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123'
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: rating: Path `rating` is required.'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if rating is less than 1', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 0
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: rating: Path `rating` (0) is less than minimum allowed value (1).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if rating is greater than 5', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 6
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: rating: Path `rating` (6) is more than maximum allowed value (5).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if foodQuality is less than 1', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        foodQuality: 0
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: foodQuality: Path `foodQuality` (0) is less than minimum allowed value (1).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if foodQuality is greater than 5', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        foodQuality: 6
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: foodQuality: Path `foodQuality` (6) is more than maximum allowed value (5).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if deliverySpeed is less than 1', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        deliverySpeed: 0
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: deliverySpeed: Path `deliverySpeed` (0) is less than minimum allowed value (1).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if deliverySpeed is greater than 5', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        deliverySpeed: 6
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: deliverySpeed: Path `deliverySpeed` (6) is more than maximum allowed value (5).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 if comment exceeds maximum length (500 characters)', async () => {
      const longComment = 'a'.repeat(501);
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        comment: longComment
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: comment: Path `comment` (`' + longComment + '`) is longer than the maximum allowed length (500).'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should accept comment at maximum length (500 characters)', async () => {
      const maxComment = 'a'.repeat(500);
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        comment: maxComment
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      const createdFeedback = {
        _id: 'feedback123',
        order: feedbackData.orderId,
        user: feedbackData.userId,
        restaurant: feedbackData.restaurantId,
        rating: feedbackData.rating,
        comment: maxComment,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(201);
      expect(res.body.comment).toBe(maxComment);
    });

    test('should handle database errors during feedback creation', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });

    test('should handle empty request body', async () => {
      // Mock Feedback.findOne to return null (no existing feedback)
      Feedback.findOne = jest.fn().mockResolvedValue(null);
      // Mock Feedback.create to reject with validation error for missing required fields
      Feedback.create = jest.fn().mockRejectedValue(new Error('Feedback validation failed: order: Path `order` is required., user: Path `user` is required., restaurant: Path `restaurant` is required., rating: Path `rating` is required.'));

      const res = await request(app)
        .post('/api/feedback')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should handle invalid orderId format', async () => {
      const feedbackData = {
        orderId: 'invalid-id',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      Feedback.create = jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed for value "invalid-id" (type string) at path "order" for model "Feedback"'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/feedback/order/:orderId - Get Feedback for Order', () => {
    test('should get feedback for an order successfully', async () => {
      const orderId = 'order123';
      const mockFeedback = {
        _id: 'feedback123',
        order: orderId,
        user: {
          _id: 'user123',
          name: 'John Doe'
        },
        restaurant: {
          _id: 'restaurant123',
          name: 'Pizza Palace'
        },
        rating: 5,
        foodQuality: 4,
        deliverySpeed: 5,
        comment: 'Great experience!',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock the chain: Feedback.findOne().populate().populate()
      const mockQuery = {
        populate: jest.fn()
          .mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(mockFeedback)
          })
      };
      Feedback.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/order/${orderId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', 'feedback123');
      expect(res.body).toHaveProperty('order', orderId);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('name', 'John Doe');
      expect(res.body).toHaveProperty('restaurant');
      expect(res.body.restaurant).toHaveProperty('name', 'Pizza Palace');
      expect(res.body).toHaveProperty('rating', 5);
      
      expect(Feedback.findOne).toHaveBeenCalledWith({ order: orderId });
    });

    test('should return null if no feedback exists for the order', async () => {
      const orderId = 'order999';

      // Mock the chain: Feedback.findOne().populate().populate() returns null
      const mockQuery = {
        populate: jest.fn()
          .mockReturnValueOnce({
            populate: jest.fn().mockResolvedValue(null)
          })
      };
      Feedback.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/order/${orderId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toBeNull();
    });

    test('should handle database errors when getting feedback for order', async () => {
      const orderId = 'order123';

      const mockQuery = {
        populate: jest.fn()
          .mockReturnValueOnce({
            populate: jest.fn().mockRejectedValue(new Error('Database connection error'))
          })
      };
      Feedback.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/order/${orderId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });

    test('should handle invalid orderId format', async () => {
      const orderId = 'invalid-id';

      const mockQuery = {
        populate: jest.fn()
          .mockReturnValueOnce({
            populate: jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'))
          })
      };
      Feedback.findOne = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/order/${orderId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/feedback/restaurant/:restaurantId - Get All Feedback for Restaurant', () => {
    test('should get all feedback for a restaurant successfully', async () => {
      const restaurantId = 'restaurant123';
      const mockFeedbacks = [
        {
          _id: 'feedback1',
          order: 'order1',
          user: {
            _id: 'user1',
            name: 'Alice'
          },
          restaurant: restaurantId,
          rating: 5,
          comment: 'Excellent!',
          createdAt: new Date('2024-01-02')
        },
        {
          _id: 'feedback2',
          order: 'order2',
          user: {
            _id: 'user2',
            name: 'Bob'
          },
          restaurant: restaurantId,
          rating: 4,
          comment: 'Good food',
          createdAt: new Date('2024-01-01')
        }
      ];

      // Mock the chain: Feedback.find().populate().sort()
      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockFeedbacks)
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('_id', 'feedback1');
      expect(res.body[0]).toHaveProperty('user');
      expect(res.body[0].user).toHaveProperty('name', 'Alice');
      expect(res.body[0]).toHaveProperty('rating', 5);
      expect(res.body[1]).toHaveProperty('_id', 'feedback2');
      expect(res.body[1].user).toHaveProperty('name', 'Bob');
      
      expect(Feedback.find).toHaveBeenCalledWith({ restaurant: restaurantId });
    });

    test('should return empty array if no feedback exists for restaurant', async () => {
      const restaurantId = 'restaurant999';

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test('should sort feedback by createdAt in descending order (newest first)', async () => {
      const restaurantId = 'restaurant123';
      const mockFeedbacks = [
        {
          _id: 'feedback1',
          createdAt: new Date('2024-01-02')
        },
        {
          _id: 'feedback2',
          createdAt: new Date('2024-01-01')
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockFeedbacks)
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      
      // Verify sort was called with correct parameter
      const sortCall = mockQuery.populate().sort;
      expect(sortCall).toHaveBeenCalledWith({ createdAt: -1 });
    });

    test('should populate user name field only', async () => {
      const restaurantId = 'restaurant123';
      const mockFeedbacks = [
        {
          _id: 'feedback1',
          user: {
            _id: 'user1',
            name: 'John Doe'
          },
          rating: 5
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockFeedbacks)
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0].user).toHaveProperty('name');
      expect(res.body[0].user).not.toHaveProperty('email');
      expect(res.body[0].user).not.toHaveProperty('password');
      
      // Verify populate was called with correct parameters
      expect(mockQuery.populate).toHaveBeenCalledWith('user', 'name');
    });

    test('should handle database errors when getting feedback for restaurant', async () => {
      const restaurantId = 'restaurant123';

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('Database connection error'))
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });

    test('should handle invalid restaurantId format', async () => {
      const restaurantId = 'invalid-id';

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockRejectedValue(new Error('Cast to ObjectId failed'))
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    });

    test('should return feedback with all fields when available', async () => {
      const restaurantId = 'restaurant123';
      const mockFeedbacks = [
        {
          _id: 'feedback1',
          order: 'order1',
          user: { name: 'Alice' },
          restaurant: restaurantId,
          rating: 5,
          foodQuality: 4,
          deliverySpeed: 5,
          comment: 'Great experience!',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockFeedbacks)
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('foodQuality', 4);
      expect(res.body[0]).toHaveProperty('deliverySpeed', 5);
      expect(res.body[0]).toHaveProperty('comment', 'Great experience!');
    });
  });

  describe('Edge Cases and Validation', () => {
    test('should handle boundary rating values (1 and 5)', async () => {
      // Test rating = 1
      const feedbackDataMin = {
        orderId: 'order1',
        userId: 'user1',
        restaurantId: 'restaurant1',
        rating: 1
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      const createdFeedbackMin = {
        _id: 'feedback1',
        ...feedbackDataMin,
        rating: 1,
        createdAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedbackMin);

      const resMin = await request(app)
        .post('/api/feedback')
        .send(feedbackDataMin);

      expect(resMin.statusCode).toBe(201);
      expect(resMin.body.rating).toBe(1);

      // Test rating = 5
      const feedbackDataMax = {
        orderId: 'order2',
        userId: 'user2',
        restaurantId: 'restaurant2',
        rating: 5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      const createdFeedbackMax = {
        _id: 'feedback2',
        ...feedbackDataMax,
        rating: 5,
        createdAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedbackMax);

      const resMax = await request(app)
        .post('/api/feedback')
        .send(feedbackDataMax);

      expect(resMax.statusCode).toBe(201);
      expect(resMax.body.rating).toBe(5);
    });

    test('should handle decimal rating values (if allowed by validation)', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 4.5
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      
      // If decimal is not allowed, it will be rejected
      Feedback.create = jest.fn().mockRejectedValue(new Error('Validation error'));

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      // Should either accept or reject based on schema validation
      expect([201, 400]).toContain(res.statusCode);
    });

    test('should handle special characters in comment', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        comment: 'Great food! 👍 😊 <script>alert("xss")</script>'
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      const createdFeedback = {
        _id: 'feedback123',
        ...feedbackData,
        createdAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(201);
      expect(res.body.comment).toBe(feedbackData.comment);
    });

    test('should handle empty comment string', async () => {
      const feedbackData = {
        orderId: 'order123',
        userId: 'user123',
        restaurantId: 'restaurant123',
        rating: 5,
        comment: ''
      };

      Feedback.findOne = jest.fn().mockResolvedValue(null);
      const createdFeedback = {
        _id: 'feedback123',
        ...feedbackData,
        comment: '',
        createdAt: new Date()
      };
      Feedback.create = jest.fn().mockResolvedValue(createdFeedback);

      const res = await request(app)
        .post('/api/feedback')
        .send(feedbackData);

      expect(res.statusCode).toBe(201);
      expect(res.body.comment).toBe('');
    });

    test('should handle malformed JSON in request body', async () => {
      const res = await request(app)
        .post('/api/feedback')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect([400, 500]).toContain(res.statusCode);
    });

    test('should handle multiple feedback queries for same restaurant', async () => {
      const restaurantId = 'restaurant123';
      const mockFeedbacks = [
        { _id: 'feedback1', rating: 5 },
        { _id: 'feedback2', rating: 4 },
        { _id: 'feedback3', rating: 3 }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnValue({
          sort: jest.fn()
            .mockResolvedValueOnce(mockFeedbacks)
            .mockResolvedValueOnce(mockFeedbacks)
        })
      };
      Feedback.find = jest.fn().mockReturnValue(mockQuery);

      const res1 = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);
      
      const res2 = await request(app)
        .get(`/api/feedback/restaurant/${restaurantId}`);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body).toHaveLength(3);
      expect(res2.body).toHaveLength(3);
    });
  });
});

