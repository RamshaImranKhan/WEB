const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middlewares/auth');

router.post('/', protect, async (req, res) => {
  try {
    const orderItems = req.body.orderItems || req.body.items;
    const {
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided'
      });
    }

    const processedItems = [];
    let calculatedSubtotal = 0;

    for (let item of orderItems) {
      const productId = item.product || item.productId;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const orderItem = {
        product: product._id,
        name: item.name || product.name,
        quantity: item.quantity,
        price: item.price || product.price,
        image: item.image || product.image || ''
      };

      processedItems.push(orderItem);
      calculatedSubtotal += orderItem.price * orderItem.quantity;

      product.stock -= item.quantity;
      await product.save();
    }

    const finalItemsPrice = itemsPrice || calculatedSubtotal;
    const finalTaxPrice = taxPrice !== undefined ? taxPrice : (finalItemsPrice * 0.10);
    const finalShippingPrice = shippingPrice !== undefined ? shippingPrice : 0;
    const finalTotalPrice = totalPrice !== undefined ? totalPrice : (finalItemsPrice + finalTaxPrice + finalShippingPrice);

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD-${year}${month}${day}-${random}`;

    const order = new Order({
      user: req.user._id,
      orderNumber: orderNumber,
      items: processedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      subtotal: finalItemsPrice,
      taxAmount: finalTaxPrice,
      shippingCost: finalShippingPrice,
      totalAmount: finalTotalPrice
    });

    await order.save();

    if (req.user && req.user._id) {
      await Cart.findOneAndUpdate(
        { userId: req.user._id },
        { items: [] }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('user', 'name email');

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/all', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments();

    res.json({
      success: true,
      count: orders.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order marked as paid',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id/deliver', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order marked as delivered',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put('/:id/status', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this order'
      });
    }

    if (order.isPaid || order.isDelivered) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid or delivered orders'
      });
    }

    for (let item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;