const express = require('express');
const router = express.Router();
const Support = require('../models/Support');

// POST: user submits help request
router.post('/', async (req, res) => {
  try {
    const { name, email, issue } = req.body;

    if (!name || !email || !issue) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newSupport = await Support.create({ name, email, issue });
    res.status(201).json({ message: 'Support request received', ticket: newSupport });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET (optional): admin fetch all tickets
router.get('/', async (req, res) => {
  try {
    const tickets = await Support.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
