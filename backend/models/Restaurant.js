const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // ← MISSING IMPORT - THIS WAS THE ISSUE!

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  image: String,
  available: {
    type: Boolean,
    default: true
  }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false // Don't return password by default
  },
  cuisine: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  phone: String,
  image: String, // Restaurant logo/image
  menu: [menuItemSchema],
  deliveryTime: {
    type: String,
    default: '30-45 min'
  },
  minOrder: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
restaurantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
restaurantSchema.methods.correctPassword = async function(candidatePassword, restaurantPassword) {
  return await bcrypt.compare(candidatePassword, restaurantPassword);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);
