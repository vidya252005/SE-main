const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  issue: { type: String, required: true },
  status: { type: String, default: 'open' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Support', supportSchema);
