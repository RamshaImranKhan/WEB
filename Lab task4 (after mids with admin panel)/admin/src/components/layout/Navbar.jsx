import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-header">
        <h3> Admin Panel</h3>
        <div className="navbar-user">
          <span>Welcome, {user.name || user.email}</span>
          <div className="navbar-actions">
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
              Store
            </a>
            <button onClick={handleLogout} className="btn btn-sm btn-outline">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar">
        <Link to="/dashboard" className={`sidebar-item ${isActive('/dashboard')}`}>
          <span></span> Dashboard
        </Link>

        <Link to="/products" className={`sidebar-item ${isActive('/products')}`}>
          <span></span> Products
        </Link>


      </div>
    </nav>
  );
};

export default Navbar;

