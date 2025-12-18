require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config/environment');

// Import routes
const indexRoutes = require('./routes/index');
const users = require('./routes/users');
const products = require('./routes/products');
const cart = require('./routes/cart');
const orders = require('./routes/orders');

const categories = require('./routes/categories');

// Initialize express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });

    console.log('MongoDB Connected successfully');
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error('\n Troubleshooting tips:');
    console.error('   1. Make sure MongoDB is installed and running');
    console.error('   2. Check if MongoDB service is started: mongod');
    console.error('   3. Verify connection string in .env file');
    console.error('   4. Default connection: mongodb://localhost:27017/final-web');
    console.error('\n  Server will continue but database operations will fail.\n');
  }
};

// Connect to database
connectDB();

// Routes
app.use('/', indexRoutes);
app.use('/api/users', users);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/orders', orders);

app.use('/api/categories', categories);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

module.exports = app;