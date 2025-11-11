/**
 * Unit tests for Feedback model validation.
 * - Tests schema validation rules
 */
const Feedback = require('../../models/Feedback');
const mongoose = require('mongoose');

describe('Feedback model - Schema Validation', () => {
  test('Feedback requires order field', () => {
    const feedback = new Feedback({
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 5
    });

    const error = feedback.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.order).toBeDefined();
  });

  test('Feedback requires user field', () => {
    const feedback = new Feedback({
      order: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 5
    });

    const error = feedback.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.user).toBeDefined();
  });

  test('Feedback requires restaurant field', () => {
    const feedback = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      rating: 5
    });

    const error = feedback.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.restaurant).toBeDefined();
  });

  test('Feedback requires rating field', () => {
    const feedback = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId()
    });

    const error = feedback.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.rating).toBeDefined();
  });

  test('Feedback rating must be between 1 and 5', () => {
    const feedback1 = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 0
    });

    const error1 = feedback1.validateSync();
    expect(error1).toBeDefined();
    expect(error1.errors.rating).toBeDefined();

    const feedback2 = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 6
    });

    const error2 = feedback2.validateSync();
    expect(error2).toBeDefined();
    expect(error2.errors.rating).toBeDefined();
  });

  test('Feedback accepts valid rating (1-5)', () => {
    const feedback = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 5
    });

    const error = feedback.validateSync();
    expect(error).toBeUndefined();
  });

  test('Feedback accepts optional fields', () => {
    const feedback = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 5,
      foodQuality: 4,
      deliverySpeed: 5,
      comment: 'Great experience!'
    });

    const error = feedback.validateSync();
    expect(error).toBeUndefined();
    expect(feedback.foodQuality).toBe(4);
    expect(feedback.deliverySpeed).toBe(5);
    expect(feedback.comment).toBe('Great experience!');
  });

  test('Feedback comment max length validation', () => {
    const longComment = 'a'.repeat(501);
    const feedback = new Feedback({
      order: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      rating: 5,
      comment: longComment
    });

    const error = feedback.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.comment).toBeDefined();
  });
});

