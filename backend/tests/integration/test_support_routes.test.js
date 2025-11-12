/**
 * Comprehensive End-to-End tests for support routes.
 *
 * This test mocks Support model DB operations so tests can run without a real DB.
 * It mounts the support router on a temporary Express app and uses supertest to call endpoints.
 */
jest.setTimeout(10000);
const express = require('express');
const request = require('supertest');

// Mocks must be in place before the router is required.
jest.mock('../../models/Support');

const Support = require('../../models/Support');

describe('Support Routes - End-to-End Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Load the support router after mocks
    const supportRouter = require('../../routes/Support');
    app.use('/api/support', supportRouter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/support - Create Support Ticket', () => {
    test('should create support ticket successfully with all fields', async () => {
      const supportData = {
        name: 'John Doe',
        email: 'john@example.com',
        issue: 'I have a problem with my order'
      };

      const createdTicket = {
        _id: 'support123',
        name: supportData.name,
        email: supportData.email,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Support request received');
      expect(res.body).toHaveProperty('ticket');
      expect(res.body.ticket).toHaveProperty('_id', 'support123');
      expect(res.body.ticket).toHaveProperty('name', supportData.name);
      expect(res.body.ticket).toHaveProperty('email', supportData.email);
      expect(res.body.ticket).toHaveProperty('issue', supportData.issue);
      expect(res.body.ticket).toHaveProperty('status', 'open');
      expect(res.body.ticket).toHaveProperty('createdAt');

      expect(Support.create).toHaveBeenCalledWith({
        name: supportData.name,
        email: supportData.email,
        issue: supportData.issue
      });
    });

    test('should create support ticket with default status "open"', async () => {
      const supportData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        issue: 'Delivery was late'
      };

      const createdTicket = {
        _id: 'support456',
        name: supportData.name,
        email: supportData.email,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ticket.status).toBe('open');
    });

    test('should create support ticket with long issue description', async () => {
      const longIssue = 'This is a very long issue description. '.repeat(20);
      const supportData = {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        issue: longIssue
      };

      const createdTicket = {
        _id: 'support789',
        name: supportData.name,
        email: supportData.email,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ticket.issue).toBe(longIssue);
    });

    test('should create support ticket with special characters in issue', async () => {
      const supportData = {
        name: 'Alice Brown',
        email: 'alice@example.com',
        issue: 'Issue with order #12345! Special chars: @#$%^&*()'
      };

      const createdTicket = {
        _id: 'support999',
        name: supportData.name,
        email: supportData.email,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ticket.issue).toBe(supportData.issue);
    });

    test('should return 400 if name is missing', async () => {
      const supportData = {
        email: 'test@example.com',
        issue: 'Test issue'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if name is empty string', async () => {
      const supportData = {
        name: '',
        email: 'test@example.com',
        issue: 'Test issue'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if email is missing', async () => {
      const supportData = {
        name: 'Test User',
        issue: 'Test issue'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if email is empty string', async () => {
      const supportData = {
        name: 'Test User',
        email: '',
        issue: 'Test issue'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if issue is missing', async () => {
      const supportData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if issue is empty string', async () => {
      const supportData = {
        name: 'Test User',
        email: 'test@example.com',
        issue: ''
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if all fields are missing', async () => {
      const res = await request(app)
        .post('/api/support')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if name and email are missing', async () => {
      const supportData = {
        issue: 'Test issue'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if name and issue are missing', async () => {
      const supportData = {
        email: 'test@example.com'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should return 400 if email and issue are missing', async () => {
      const supportData = {
        name: 'Test User'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
      expect(Support.create).not.toHaveBeenCalled();
    });

    test('should handle database errors during ticket creation', async () => {
      const supportData = {
        name: 'Test User',
        email: 'test@example.com',
        issue: 'Test issue'
      };

      Support.create = jest.fn().mockRejectedValue(new Error('Database connection error'));

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });

    test('should handle validation errors from database', async () => {
      const supportData = {
        name: 'Test User',
        email: 'test@example.com',
        issue: 'Test issue'
      };

      Support.create = jest.fn().mockRejectedValue(new Error('Support validation failed: email: Email format is invalid'));

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message');
    });

    test('should handle malformed JSON in request body', async () => {
      const res = await request(app)
        .post('/api/support')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect([400, 500]).toContain(res.statusCode);
    });

    test('should create multiple support tickets independently', async () => {
      const supportData1 = {
        name: 'User 1',
        email: 'user1@example.com',
        issue: 'Issue 1'
      };

      const supportData2 = {
        name: 'User 2',
        email: 'user2@example.com',
        issue: 'Issue 2'
      };

      const createdTicket1 = {
        _id: 'support1',
        ...supportData1,
        status: 'open',
        createdAt: new Date()
      };

      const createdTicket2 = {
        _id: 'support2',
        ...supportData2,
        status: 'open',
        createdAt: new Date()
      };

      Support.create = jest.fn()
        .mockResolvedValueOnce(createdTicket1)
        .mockResolvedValueOnce(createdTicket2);

      const res1 = await request(app)
        .post('/api/support')
        .send(supportData1);

      const res2 = await request(app)
        .post('/api/support')
        .send(supportData2);

      expect(res1.statusCode).toBe(201);
      expect(res2.statusCode).toBe(201);
      expect(res1.body.ticket._id).toBe('support1');
      expect(res2.body.ticket._id).toBe('support2');
      expect(res1.body.ticket.name).toBe('User 1');
      expect(res2.body.ticket.name).toBe('User 2');
    });

    test('should create ticket with whitespace-only name (if not trimmed by validation)', async () => {
      const supportData = {
        name: '   ',
        email: 'test@example.com',
        issue: 'Test issue'
      };

      // This depends on whether the route trims whitespace
      // If validation allows it, it should work; if not, it should fail
      const createdTicket = {
        _id: 'support123',
        name: supportData.name,
        email: supportData.email,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      // The route checks for truthy values, so whitespace-only strings pass
      // but might fail at database validation level
      expect([201, 500]).toContain(res.statusCode);
    });
  });

  describe('GET /api/support - Get All Support Tickets', () => {
    test('should get all support tickets successfully', async () => {
      const mockTickets = [
        {
          _id: 'support1',
          name: 'John Doe',
          email: 'john@example.com',
          issue: 'Order issue',
          status: 'open',
          createdAt: new Date('2024-01-02')
        },
        {
          _id: 'support2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          issue: 'Delivery issue',
          status: 'open',
          createdAt: new Date('2024-01-01')
        }
      ];

      // Mock the chain: Support.find().sort()
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('_id', 'support1');
      expect(res.body[0]).toHaveProperty('name', 'John Doe');
      expect(res.body[0]).toHaveProperty('email', 'john@example.com');
      expect(res.body[0]).toHaveProperty('issue', 'Order issue');
      expect(res.body[0]).toHaveProperty('status', 'open');
      expect(res.body[1]).toHaveProperty('_id', 'support2');
      expect(res.body[1]).toHaveProperty('name', 'Jane Smith');

      expect(Support.find).toHaveBeenCalledWith();
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    test('should return empty array if no tickets exist', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test('should sort tickets by createdAt in descending order (newest first)', async () => {
      const mockTickets = [
        {
          _id: 'support1',
          name: 'Newest',
          email: 'newest@example.com',
          issue: 'New issue',
          status: 'open',
          createdAt: new Date('2024-01-03')
        },
        {
          _id: 'support2',
          name: 'Oldest',
          email: 'oldest@example.com',
          issue: 'Old issue',
          status: 'open',
          createdAt: new Date('2024-01-01')
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]._id).toBe('support1');
      expect(res.body[0].name).toBe('Newest');
      expect(res.body[1]._id).toBe('support2');
      expect(res.body[1].name).toBe('Oldest');

      // Verify sort was called with correct parameter
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    test('should return tickets with all fields', async () => {
      const mockTickets = [
        {
          _id: 'support1',
          name: 'Test User',
          email: 'test@example.com',
          issue: 'Test issue description',
          status: 'open',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(res.body[0]).toHaveProperty('_id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('issue');
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0]).toHaveProperty('createdAt');
    });

    test('should return tickets with different statuses', async () => {
      const mockTickets = [
        {
          _id: 'support1',
          name: 'User 1',
          email: 'user1@example.com',
          issue: 'Issue 1',
          status: 'open',
          createdAt: new Date('2024-01-02')
        },
        {
          _id: 'support2',
          name: 'User 2',
          email: 'user2@example.com',
          issue: 'Issue 2',
          status: 'closed',
          createdAt: new Date('2024-01-01')
        },
        {
          _id: 'support3',
          name: 'User 3',
          email: 'user3@example.com',
          issue: 'Issue 3',
          status: 'open',
          createdAt: new Date('2024-01-03')
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(3);
      expect(res.body[0].status).toBe('open');
      expect(res.body[1].status).toBe('closed');
      expect(res.body[2].status).toBe('open');
    });

    test('should handle database errors when getting tickets', async () => {
      const mockQuery = {
        sort: jest.fn().mockRejectedValue(new Error('Database connection error'))
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Database connection error');
    });

    test('should handle large number of tickets', async () => {
      const mockTickets = Array.from({ length: 100 }, (_, i) => ({
        _id: `support${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        issue: `Issue ${i}`,
        status: 'open',
        createdAt: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`)
      }));

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(100);
      expect(res.body[0]._id).toBe('support0');
      expect(res.body[99]._id).toBe('support99');
    });

    test('should return tickets with special characters in fields', async () => {
      const mockTickets = [
        {
          _id: 'support1',
          name: 'O\'Brien & Co.',
          email: 'test+special@example.com',
          issue: 'Issue with special chars: @#$%^&*()',
          status: 'open',
          createdAt: new Date('2024-01-01')
        }
      ];

      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res = await request(app)
        .get('/api/support');

      expect(res.statusCode).toBe(200);
      expect(res.body[0].name).toBe('O\'Brien & Co.');
      expect(res.body[0].email).toBe('test+special@example.com');
      expect(res.body[0].issue).toBe('Issue with special chars: @#$%^&*()');
    });

    test('should handle multiple GET requests', async () => {
      const mockTickets = [
        {
          _id: 'support1',
          name: 'Test User',
          email: 'test@example.com',
          issue: 'Test issue',
          status: 'open',
          createdAt: new Date('2024-01-01')
        }
      ];

      const mockQuery = {
        sort: jest.fn()
          .mockResolvedValueOnce(mockTickets)
          .mockResolvedValueOnce(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const res1 = await request(app)
        .get('/api/support');

      const res2 = await request(app)
        .get('/api/support');

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body).toHaveLength(1);
      expect(res2.body).toHaveLength(1);
    });
  });

  describe('Edge Cases and Integration', () => {
    test('should create ticket and then retrieve it in GET request', async () => {
      // First create a ticket
      const supportData = {
        name: 'Integration Test',
        email: 'integration@example.com',
        issue: 'Integration test issue'
      };

      const createdTicket = {
        _id: 'support-integration',
        ...supportData,
        status: 'open',
        createdAt: new Date('2024-01-01')
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const createRes = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(createRes.statusCode).toBe(201);

      // Then retrieve all tickets
      const mockTickets = [createdTicket];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockTickets)
      };
      Support.find = jest.fn().mockReturnValue(mockQuery);

      const getRes = await request(app)
        .get('/api/support');

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body).toHaveLength(1);
      expect(getRes.body[0]._id).toBe('support-integration');
      expect(getRes.body[0].name).toBe('Integration Test');
    });

    test('should handle concurrent POST requests', async () => {
      const supportData1 = {
        name: 'User 1',
        email: 'user1@example.com',
        issue: 'Issue 1'
      };

      const supportData2 = {
        name: 'User 2',
        email: 'user2@example.com',
        issue: 'Issue 2'
      };

      const createdTicket1 = {
        _id: 'support1',
        ...supportData1,
        status: 'open',
        createdAt: new Date()
      };

      const createdTicket2 = {
        _id: 'support2',
        ...supportData2,
        status: 'open',
        createdAt: new Date()
      };

      Support.create = jest.fn()
        .mockResolvedValueOnce(createdTicket1)
        .mockResolvedValueOnce(createdTicket2);

      // Execute both requests
      const [res1, res2] = await Promise.all([
        request(app).post('/api/support').send(supportData1),
        request(app).post('/api/support').send(supportData2)
      ]);

      expect(res1.statusCode).toBe(201);
      expect(res2.statusCode).toBe(201);
      expect(res1.body.ticket._id).toBe('support1');
      expect(res2.body.ticket._id).toBe('support2');
    });

    test('should handle very long name field', async () => {
      const longName = 'A'.repeat(200);
      const supportData = {
        name: longName,
        email: 'test@example.com',
        issue: 'Test issue'
      };

      const createdTicket = {
        _id: 'support123',
        name: longName,
        email: supportData.email,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ticket.name).toBe(longName);
    });

    test('should handle very long email field', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const supportData = {
        name: 'Test User',
        email: longEmail,
        issue: 'Test issue'
      };

      const createdTicket = {
        _id: 'support123',
        name: supportData.name,
        email: longEmail,
        issue: supportData.issue,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ticket.email).toBe(longEmail);
    });

    test('should handle unicode characters in all fields', async () => {
      const supportData = {
        name: 'José García 中文',
        email: 'test@exämple.com',
        issue: 'Problème avec la commande 🍕'
      };

      const createdTicket = {
        _id: 'support123',
        ...supportData,
        status: 'open',
        createdAt: new Date()
      };
      Support.create = jest.fn().mockResolvedValue(createdTicket);

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(201);
      expect(res.body.ticket.name).toBe('José García 中文');
      expect(res.body.ticket.email).toBe('test@exämple.com');
      expect(res.body.ticket.issue).toBe('Problème avec la commande 🍕');
    });

    test('should handle null values in request (should fail validation)', async () => {
      const supportData = {
        name: null,
        email: 'test@example.com',
        issue: 'Test issue'
      };

      // The route checks for truthy values, so null should fail
      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
    });

    test('should handle undefined values in request (should fail validation)', async () => {
      const supportData = {
        name: undefined,
        email: 'test@example.com',
        issue: 'Test issue'
      };

      const res = await request(app)
        .post('/api/support')
        .send(supportData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'All fields are required');
    });
  });
});

