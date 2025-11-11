import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { restaurantAPI, orderAPI } from '../utils/api';

import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  console.log("✅ Rendering RestaurantDashboard");
  const { restaurant, isLoggedIn } = useRestaurant();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    totalMenuItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/restaurant-login');
      return;
    }
    const run = async () => {
      await fetchDashboardData();
      setLoading(false);
    };
    run();

    // poll every 8s for new orders
    const id = setInterval(fetchDashboardData, 8000);
    return () => clearInterval(id);
  }, [isLoggedIn, navigate]);

  const fetchDashboardData = async () => {
    try {
      const rid = restaurant?.id || restaurant?._id;
      if (!rid) return;
  
      // 1️⃣ Fetch stats
      const statsData = await restaurantAPI.getStats();
  
      // 2️⃣ Fetch orders (for recent orders table)
      const orders = await orderAPI.getRestaurantOrders(rid);
  
      setStats(statsData);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'preparing': return '#2196f3';
      case 'ready': return '#ff9800';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'confirmed': return '#4caf50';
      case 'out for delivery': return '#9C27B0';
      default: return '#9e9e9e';
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {restaurant?.name}! 👋</h1>
          <p>Here's what's happening with your restaurant today</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e3f2fd' }}>📦</div>
            <div className="stat-info">
              <h3>{stats.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fff3e0' }}>⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingOrders}</h3>
              <p>Pending Orders</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e8f5e9' }}>💰</div>
            <div className="stat-info">
              <h3>₹{Number(stats.todayRevenue).toFixed(2)}</h3>
              <p>Today's Revenue</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fce4ec' }}>🍽️</div>
            <div className="stat-info">
              <h3>{stats.totalMenuItems}</h3>
              <p>Menu Items</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/restaurant/menu" className="action-card">
              <span className="action-icon">📋</span>
              <h3>Manage Menu</h3>
              <p>Add, edit or remove menu items</p>
            </Link>

            <Link to="/restaurant/orders" className="action-card">
              <span className="action-icon">📦</span>
              <h3>View Orders</h3>
              <p>Manage incoming orders</p>
            </Link>

            <Link to="/restaurant/profile" className="action-card">
              <span className="action-icon">⚙️</span>
              <h3>Restaurant Profile</h3>
              <p>Update restaurant information</p>
            </Link>

            <Link to="/restaurant/analytics" className="action-card">
              <span className="action-icon">📊</span>
              <h3>Analytics</h3>
              <p>View sales and performance</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="recent-orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/restaurant/orders" className="view-all-link">View All →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="no-orders">
              <p>No recent orders</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.orderNumber || order._id.slice(-6)}</strong></td>
                      <td>{order.customerName || order.user?.name || 'Customer'}</td>
                      <td>{order.items?.length || 0} items</td>
                      <td>₹{Number(order.totalAmount || order.total).toFixed(2)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
