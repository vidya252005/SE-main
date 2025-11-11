/**
 * Unit tests for Support model validation.
 * - Tests schema validation rules
 */
const Support = require('../../models/Support');

describe('Support model - Schema Validation', () => {
  test('Support requires name field', () => {
    const support = new Support({
      email: 'test@example.com',
      issue: 'Test issue'
    });

    const error = support.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  test('Support requires email field', () => {
    const support = new Support({
      name: 'Test User',
      issue: 'Test issue'
    });

    const error = support.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  test('Support requires issue field', () => {
    const support = new Support({
      name: 'Test User',
      email: 'test@example.com'
    });

    const error = support.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.issue).toBeDefined();
  });

  test('Support has default status "open"', () => {
    const support = new Support({
      name: 'Test User',
      email: 'test@example.com',
      issue: 'Test issue'
    });

    expect(support.status).toBe('open');
  });

  test('Support accepts valid data', () => {
    const support = new Support({
      name: 'Test User',
      email: 'test@example.com',
      issue: 'Test issue description'
    });

    const error = support.validateSync();
    expect(error).toBeUndefined();
    expect(support.name).toBe('Test User');
    expect(support.email).toBe('test@example.com');
    expect(support.issue).toBe('Test issue description');
    expect(support.status).toBe('open');
  });

  test('Support has createdAt timestamp', () => {
    const support = new Support({
      name: 'Test User',
      email: 'test@example.com',
      issue: 'Test issue'
    });

    expect(support.createdAt).toBeDefined();
  });
});

