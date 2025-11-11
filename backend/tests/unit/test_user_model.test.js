/**
 * Unit tests for User model methods.
 * - Mocks bcryptjs to avoid expensive hashing.
 */
jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const User = require('../../models/User');

describe('User model - correctPassword', () => {
  beforeAll(() => {
    // stub bcrypt.compare to return true when called with known values
    bcrypt.compare.mockImplementation(async (candidate, hash) => {
      if (candidate === 'plainpassword' && hash === 'hashedpassword') return true;
      return false;
    });
  });

  test('correctPassword returns true for matching passwords', async () => {
    // create a minimal fake user object that uses the schema method
    const fakeUser = new User({
      name: 'Test',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    const res = await fakeUser.correctPassword('plainpassword', fakeUser.password);
    expect(res).toBe(true);
  });

  test('correctPassword returns false for non-matching password', async () => {
    const fakeUser = new User({
      name: 'Test2',
      email: 'test2@example.com',
      password: 'hashedpassword',
    });

    const res = await fakeUser.correctPassword('wrong', fakeUser.password);
    expect(res).toBe(false);
  });
});
