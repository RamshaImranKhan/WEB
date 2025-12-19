const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middlewares/auth');

// Render Admin Orders Page
router.get('/orders', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('user').sort('-createdAt');
    res.render('admin-orders', { orders });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update Order Status (Step-by-Step)
router.post('/order/update-status', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    const currentStatus = order.orderStatus;
    const allowedTransitions = {
      'Placed': 'Processing',
      'Processing': 'Delivered'
    };

    if (allowedTransitions[currentStatus] === status) {
      order.orderStatus = status;
      await order.save();

      // If request came from React Admin (JSON), return JSON
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, message: 'Status updated', order });
      }

      res.redirect('/api/admin/orders');
    } else {
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(400).json({ success: false, message: `Invalid status transition from ${currentStatus} to ${status}` });
      }
      res.status(400).send(`Invalid status transition from ${currentStatus} to ${status}`);
    }

  } catch (error) {
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.status(500).send(error.message);
  }
});

router.get('/stats', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();

    const allOrders = await Order.find({});

    const totalUsers = await User.countDocuments({
      role: { $nin: ['admin', 'superadmin'] }
    });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('user', 'name email');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
