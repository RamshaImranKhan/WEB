
const mongoose = require('mongoose');

if (mongoose.models.Product) {
  delete mongoose.models.Product;
  delete mongoose.modelSchemas.Product;
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    default: '/images/default-product.jpg'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  strict: true,
  strictQuery: true,
  versionKey: false
});

module.exports = mongoose.model('Product', productSchema);