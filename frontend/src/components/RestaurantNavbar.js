import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import './Navbar.css';

const RestaurantNavbar = () => {
  const { restaurant, logout } = useRestaurant();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar restaurant-navbar">
      <div className="nav-container">
        <Link to="/restaurant/dashboard" className="nav-logo restaurant-logo">
          🍳 Restaurant Portal
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/restaurant/dashboard" className="nav-link">
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/restaurant/menu" className="nav-link">
              <span className="nav-icon">📋</span>
              Menu
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/restaurant/orders" className="nav-link">
              <span className="nav-icon">📦</span>
              Orders
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/restaurant/profile" className="nav-link">
              <span className="nav-icon">⚙️</span>
              Profile
            </Link>
          </li>
          {restaurant && (
            <>
              <li className="nav-item">
                <span className="nav-link restaurant-name">
                  <span className="nav-icon">🏪</span>
                  {restaurant.name}
                </span>
              </li>
              <li className="nav-item">
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  <span className="nav-icon">🚪</span>
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default RestaurantNavbar;