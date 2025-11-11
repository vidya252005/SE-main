/**
 * Unit tests for Restaurant model methods.
 * - Tests password hashing and validation
 */
jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const Restaurant = require('../../models/Restaurant');

describe('Restaurant model - correctPassword', () => {
  beforeAll(() => {
    // Mock bcrypt.compare to return true for matching passwords
    bcrypt.compare.mockImplementation(async (candidate, hash) => {
      if (candidate === 'plainpassword' && hash === 'hashedpassword') return true;
      return false;
    });
  });

  test('correctPassword returns true for matching passwords', async () => {
    const fakeRestaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'hashedpassword'
    });

    const res = await fakeRestaurant.correctPassword('plainpassword', fakeRestaurant.password);
    expect(res).toBe(true);
  });

  test('correctPassword returns false for non-matching password', async () => {
    const fakeRestaurant = new Restaurant({
      name: 'Test Restaurant 2',
      email: 'test2@restaurant.com',
      password: 'hashedpassword'
    });

    const res = await fakeRestaurant.correctPassword('wrongpassword', fakeRestaurant.password);
    expect(res).toBe(false);
  });

  test('correctPassword handles empty password', async () => {
    const fakeRestaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'hashedpassword'
    });

    const res = await fakeRestaurant.correctPassword('', fakeRestaurant.password);
    expect(res).toBe(false);
  });
});

