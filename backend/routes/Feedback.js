const express = require('express');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');

const router = express.Router();

// Create feedback
router.post('/', async (req, res) => {
  try {
    const { orderId, userId, restaurantId, rating, foodQuality, deliverySpeed, comment } = req.body;
    
    // Check if feedback already exists for this order
    const existingFeedback = await Feedback.findOne({ order: orderId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this order' });
    }
    
    const feedback = await Feedback.create({
      order: orderId,
      user: userId,
      restaurant: restaurantId,
      rating,
      foodQuality,
      deliverySpeed,
      comment
    });
    
    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get feedback for an order
router.get('/order/:orderId', async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ order: req.params.orderId })
      .populate('user', 'name')
      .populate('restaurant', 'name');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all feedback for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;