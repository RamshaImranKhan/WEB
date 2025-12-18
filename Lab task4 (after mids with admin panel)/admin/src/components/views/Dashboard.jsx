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
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
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

      </div>


    </div>
  );
};

export default Dashboard;
