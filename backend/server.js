const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const restaurantRoutes = require('./routes/restaurantRoutes'); 
const feedbackRoutes = require('./routes/Feedback');
const app = express();

/** ✅ CORS Configuration */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || /^http:\/\/10\.\d+\.\d+\.\d+:3000$/.test(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

/** ✅ Body parsing */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** ✅ Request logger */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/** ✅ Health check - MUST come before other routes */
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  const healthData = {
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbState: mongoose.connection.readyState
  };
  console.log('📤 Sending health response:', healthData);
  return res.json(healthData);
});

/** ✅ API Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', require('./routes/Support'));



/** ✅ Root endpoint */
app.get('/', (req, res) => {
  res.json({
    message: 'Food Delivery API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      restaurant: '/api/restaurant', // ✅ ADDED
      restaurants: '/api/restaurants',
      orders: '/api/orders'
    }
  });
});

/** ✅ 404 handler */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /health',
      'GET /api/restaurants',
      'POST /api/auth/user/login',
      'POST /api/auth/user/register',
      'POST /api/auth/restaurant/login',
      'POST /api/auth/restaurant/register',
      'GET /api/restaurant/menu',  // ✅ ADDED
      'POST /api/restaurant/menu'  // ✅ ADDED
    ]
  });
});

/** ✅ Error handler */
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.path
  });
});

/** ✅ Database connection and server start */
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery';

mongoose.set('strictQuery', false);

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ Connected to MongoDB');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 API: http://localhost:${PORT}`);
      console.log(`🏥 Health: http://localhost:${PORT}/health`);
      console.log(`📝 Restaurants: http://localhost:${PORT}/api/restaurants`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📡 Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('👋 MongoDB connection closed due to app termination');
  process.exit(0);
});

startServer();