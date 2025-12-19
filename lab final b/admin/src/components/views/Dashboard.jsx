import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,

  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axiosInstance.get('/admin/stats');
      const statsData = response.stats || response.data?.stats || {};
      setStats(statsData);
      // set recent orders if available (assuming statsData includes recentOrders)
      if (statsData.recentOrders) {
        setRecentOrders(statsData.recentOrders);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const [recentOrders, setRecentOrders] = useState([]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axiosInstance.post('/admin/order/update-status', {
        orderId,
        status: newStatus
      });
      // Refresh dashboard
      loadDashboard();
      alert('Order status updated successfully');
    } catch (err) {
      console.error('Failed to update status', err);
      // alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <h2>{stats.totalUsers || 0}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Products</h3>
          <h2>{stats.totalProducts || 0}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <h2>{stats.totalOrders || 0}</h2>
        </div>



      </div>

      <div className="recent-orders-section">
        <h2>Recent Orders</h2>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.user ? (order.user.email || order.user.name) : 'Guest'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td>
                      {order.orderStatus === 'Placed' && (
                        <button
                          className="btn-action btn-process"
                          onClick={() => handleStatusUpdate(order._id, 'Processing')}
                        >
                          Mark Processing
                        </button>
                      )}
                      {order.orderStatus === 'Processing' && (
                        <button
                          className="btn-action btn-deliver"
                          onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {['Delivered', 'Cancelled'].includes(order.orderStatus) && (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No recent orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
