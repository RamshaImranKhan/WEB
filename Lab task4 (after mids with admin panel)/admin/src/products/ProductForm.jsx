import React, { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosInstance';
import './ProductForm.css';

const ProductForm = ({ product, onClose, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    image: '',
    category: '',
    isAvailable: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('ProductForm - Categories received:', categories);
    console.log('ProductForm - Categories length:', categories.length);
  }, [categories]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || 0,
        image: product.image || '',
        category: product.category || '',
        isAvailable: product.isAvailable !== false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        image: formData.image || '',
        category: formData.category,
        isAvailable: formData.isAvailable,
      };

      console.log('Submitting product data:', submitData);

      let result;
      if (product) {
        result = await axiosInstance.put(`/products/${product._id}`, submitData);
        console.log('Product updated:', result);
        alert('Product updated successfully!');
      } else {
        result = await axiosInstance.post('/products', submitData);
        console.log('Product created:', result);
        alert('Product created successfully!');
      }

      onClose();
    } catch (err) {
      console.error('Product save error:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Select a category</option>
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat._id || cat.name || cat} value={cat.name || cat}>
                    {cat.name || cat}
                  </option>
                ))
              ) : (
                <option value="" disabled>No categories available</option>
              )}
            </select>
            {categories && categories.length === 0 && (
              <small style={{ color: '#ff6b6b' }}>No categories found. Please create categories first.</small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              Available
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;