const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/index.html'));
});

router.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/cart.html'));
});

router.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/checkout.html'));
});

router.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/contact.html'));
});

router.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/gallery.html'));
});

router.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/menu.html'));
});

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/register.html'));
});

router.get('/thankyou', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/thankyou.html'));
});

router.get('/myaccount', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/site/myaccount.html'));
});

router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

router.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'MERN Stack E-commerce API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders'
    }
  });
});

module.exports = router;