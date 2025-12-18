const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const { featured, limit, search } = req.query;
    let query = {};

    if (featured) query.featured = featured === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .limit(parseInt(limit) || 0)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const productData = {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      image: req.body.image || '/images/default-product.jpg',
      stock: parseInt(req.body.stock) || 0,
      category: req.body.category,
      featured: req.body.featured || false,
      isAvailable: req.body.isAvailable !== false
    };

    if (!productData.name || !productData.description || productData.price === undefined || isNaN(productData.price)) {
      return res.status(400).json({
        message: 'Product name, description, and valid price are required'
      });
    }

    if (!productData.category) {
      return res.status(400).json({
        message: 'Category is required'
      });
    }

    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(400).json({
      message: error.message || 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const allowedFields = ['name', 'description', 'price', 'image', 'stock', 'category', 'featured', 'isAvailable'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'price') {
          product[field] = parseFloat(req.body[field]);
        } else if (field === 'stock') {
          product[field] = parseInt(req.body[field]) || 0;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Product update error:', error);
    res.status(400).json({
      message: error.message || 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
