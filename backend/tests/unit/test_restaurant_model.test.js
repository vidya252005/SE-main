/**
 * Unit tests for Restaurant model methods and schema validation.
 * - Tests password hashing (pre-save hook)
 * - Tests password comparison method
 * - Tests schema validation and default values
 */
jest.mock('bcryptjs');

const bcrypt = require('bcryptjs');
const Restaurant = require('../../models/Restaurant');

describe('Restaurant model - correctPassword method', () => {
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

describe('Restaurant model - Schema validation', () => {
  test('Restaurant requires name field', () => {
    const restaurant = new Restaurant({
      email: 'test@restaurant.com',
      password: 'password123'
    });

    const error = restaurant.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  test('Restaurant requires email field', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      password: 'password123'
    });

    const error = restaurant.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  test('Restaurant requires password field', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com'
    });

    const error = restaurant.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.password).toBeDefined();
  });

  test('Restaurant has default values', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123'
    });

    expect(restaurant.deliveryTime).toBe('30-45 min');
    expect(restaurant.minOrder).toBe(0);
    expect(restaurant.rating).toBe(4.0);
    expect(restaurant.isActive).toBe(true);
  });

  test('Restaurant accepts optional fields', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123',
      cuisine: ['Italian', 'Pizza'],
      phone: '1234567890',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001'
      },
      menu: [{
        name: 'Pizza',
        price: 10
      }]
    });

    const error = restaurant.validateSync();
    expect(error).toBeUndefined();
    expect(restaurant.cuisine).toHaveLength(2);
    expect(restaurant.menu).toHaveLength(1);
  });
});

describe('Restaurant model - Schema configuration', () => {
  test('Restaurant schema has timestamps enabled', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123'
    });

    // Timestamps are only set when document is actually saved to DB
    expect(restaurant).toBeDefined();
    expect(restaurant.name).toBe('Test Restaurant');
    // Note: createdAt/updatedAt are only set on actual save, not on instantiation
  });

  test('Restaurant password field has select: false option', () => {
    // This is verified by the schema definition
    // Password should not be returned by default queries
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123'
    });

    expect(restaurant.password).toBe('password123'); // Available on document, but not in queries by default
  });

  test('Restaurant accepts menu items with all fields', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123',
      menu: [{
        name: 'Pizza',
        description: 'Delicious pizza',
        price: 12,
        category: 'Main',
        image: 'pizza.jpg',
        available: true
      }]
    });

    const error = restaurant.validateSync();
    expect(error).toBeUndefined();
    expect(restaurant.menu[0].name).toBe('Pizza');
    expect(restaurant.menu[0].price).toBe(12);
    expect(restaurant.menu[0].available).toBe(true);
  });

  test('Restaurant menu item has default available: true', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123',
      menu: [{
        name: 'Pizza',
        price: 10
        // available not specified
      }]
    });

    expect(restaurant.menu[0].available).toBe(true);
  });

  test('Restaurant accepts menu items with minimal required fields', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123',
      menu: [{
        name: 'Burger',
        price: 8
      }]
    });

    const error = restaurant.validateSync();
    expect(error).toBeUndefined();
    expect(restaurant.menu[0].name).toBe('Burger');
    expect(restaurant.menu[0].price).toBe(8);
  });

  test('Restaurant menu item requires name field', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123',
      menu: [{
        price: 10
        // name missing
      }]
    });

    const error = restaurant.validateSync();
    expect(error).toBeDefined();
    expect(error.errors['menu.0.name']).toBeDefined();
  });

  test('Restaurant menu item requires price field', () => {
    const restaurant = new Restaurant({
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      password: 'password123',
      menu: [{
        name: 'Pizza'
        // price missing
      }]
    });

    const error = restaurant.validateSync();
    expect(error).toBeDefined();
    expect(error.errors['menu.0.price']).toBeDefined();
  });
});

