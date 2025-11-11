/**
 * Unit tests for Order model validation.
 * - Tests schema validation rules
 */
const Order = require('../../models/Order');
const mongoose = require('mongoose');

describe('Order model - Schema Validation', () => {
  test('Order requires user field', () => {
    const order = new Order({
      restaurant: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 100
    });

    const error = order.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.user).toBeDefined();
  });

  test('Order requires restaurant field', () => {
    const order = new Order({
      user: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 100
    });

    const error = order.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.restaurant).toBeDefined();
  });

  test('Order requires totalAmount field', () => {
    const order = new Order({
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      items: []
    });

    const error = order.validateSync();
    expect(error).toBeDefined();
    expect(error.errors.totalAmount).toBeDefined();
  });

  test('Order has default status "pending"', () => {
    const order = new Order({
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 100
    });

    expect(order.status).toBe('pending');
  });

  test('Order has default paymentStatus "pending"', () => {
    const order = new Order({
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      items: [],
      totalAmount: 100
    });

    expect(order.paymentStatus).toBe('pending');
  });

  test('Order accepts valid status values', () => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out for delivery', 'delivered', 'cancelled'];
    
    validStatuses.forEach(status => {
      const order = new Order({
        user: new mongoose.Types.ObjectId(),
        restaurant: new mongoose.Types.ObjectId(),
        items: [],
        totalAmount: 100,
        status: status
      });

      const error = order.validateSync();
      expect(error).toBeUndefined();
    });
  });

  test('Order accepts valid paymentStatus values', () => {
    const validPaymentStatuses = ['pending', 'completed', 'failed'];
    
    validPaymentStatuses.forEach(paymentStatus => {
      const order = new Order({
        user: new mongoose.Types.ObjectId(),
        restaurant: new mongoose.Types.ObjectId(),
        items: [],
        totalAmount: 100,
        paymentStatus: paymentStatus
      });

      const error = order.validateSync();
      expect(error).toBeUndefined();
    });
  });

  test('Order accepts items array', () => {
    const order = new Order({
      user: new mongoose.Types.ObjectId(),
      restaurant: new mongoose.Types.ObjectId(),
      items: [
        {
          menuItem: new mongoose.Types.ObjectId(),
          name: 'Pizza',
          price: 10,
          quantity: 2
        }
      ],
      totalAmount: 20
    });

    const error = order.validateSync();
    expect(error).toBeUndefined();
    expect(order.items).toHaveLength(1);
    expect(order.items[0].name).toBe('Pizza');
  });
});

