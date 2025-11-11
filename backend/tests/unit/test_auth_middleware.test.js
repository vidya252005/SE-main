/**
 * Unit tests for authentication middleware (middleware/auth.js)
 * - Mocks jwt.verify and User model findById to exercise success/failure branches.
 */
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { authenticateRestaurant } = require('../../middleware/auth');

describe('authenticateRestaurant middleware', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('returns 401 when no token present', async () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 for invalid token', async () => {
    const req = { headers: { authorization: 'Bearer invalidtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    jwt.verify.mockImplementation(() => { throw new Error('invalid'); });

    await authenticateRestaurant(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: expect.any(String)
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('attaches user and calls next when token valid', async () => {
    const req = { headers: { authorization: 'Bearer validtoken' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    // jwt returns decoded id
    jwt.verify.mockReturnValue({ id: 'user123' });
    // mock User.findById to return a user
    User.findById = jest.fn().mockResolvedValue({ _id: 'user123', name: 'abc', email: 'a@b.com' });

    await authenticateRestaurant(req, res, next);

    expect(User.findById).toHaveBeenCalledWith('user123');
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
