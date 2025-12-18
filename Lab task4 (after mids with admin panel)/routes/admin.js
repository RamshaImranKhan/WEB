const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect, authorize } = require('../middlewares/auth');

router.get('/stats', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
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
