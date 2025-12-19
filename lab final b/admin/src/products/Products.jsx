import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import ProductForm from './ProductForm';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);


  useEffect(() => {
    if (!showForm) {
      loadProducts();
    }
  }, [showForm]);

  const loadProducts = async () => {
    try {
      const response = await axiosInstance.get('/products');

      const productsList = response.products || response.data?.products || (Array.isArray(response) ? response : []);
      setProducts(productsList);
      console.log('Products loaded:', productsList);
      console.log('Products count:', productsList.length);
    } catch (err) {
      console.error('Failed to load products:', err);
      console.error('Error details:', err.response || err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories');

      console.log('Categories API response (full):', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));

      let categoriesList = [];
      if (Array.isArray(response)) {
        categoriesList = response;
      } else if (response && response.categories) {
        categoriesList = response.categories;
      } else if (response && response.data && response.data.categories) {
        categoriesList = response.data.categories;
      } else if (response && Array.isArray(response.data)) {
        categoriesList = response.data;
      }

      setCategories(categoriesList);
      console.log('Categories loaded:', categoriesList);
      console.log('Categories count:', categoriesList.length);

      if (categoriesList.length === 0) {
        console.warn('⚠️ No categories found in response!');
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      console.error('Error details:', err.response || err.message);

      setCategories([]);
    }
  };

  const handleEdit = (product) => {
    loadCategories();
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/products/${productId}`);
      loadProducts();
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product: ' + (err.message || 'Unknown error'));
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
    loadCategories();
  };

  const handleAddProduct = () => {
    loadCategories();
    setShowForm(true);
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={handleFormClose}
          categories={categories}
        />
      )}

      <div className="products-table-container">
        {products.length === 0 ? (
          <p>No products found. Add your first product!</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <img
                      src={
                        product.image
                          ? product.image.startsWith('http')
                            ? product.image
                            : `http://localhost:3000${product.image}`
                          : 'https://via.placeholder.com/50'
                      }
                      alt={product.name}
                      className="product-thumb"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/50';
                      }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category || 'N/A'}</td>
                  <td>${product.price?.toFixed(2) || '0.00'}</td>
                  <td>{product.stock || 0}</td>
                  <td>
                    <span className={`status-badge ${product.isAvailable ? 'available' : 'unavailable'}`}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Products;