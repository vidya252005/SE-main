import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const UserNavbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar user-navbar">
      <div className="nav-container">
        <Link to="/home" className="nav-logo">
          🍕 FoodDeliver
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/home" className="nav-link">
              <span className="nav-icon">🏠</span>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/restaurants" className="nav-link">
              <span className="nav-icon">🍽️</span>
              Restaurants
            </Link>
          </li>
          

          <li className="nav-item">
            <Link to="/cart" className="nav-link cart-link">
              <span className="nav-icon">🛒</span>
              Cart
              {getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </Link>
          </li>
          {isLoggedIn ? (
            <>
              <li className="nav-item">
                <Link to="/orders" className="nav-link">
                  <span className="nav-icon">📦</span>
                  My Orders
                </Link>
              </li>
              <Link to="/help" className="nav-link">Help & Support</Link>
              <li className="nav-item">
                <span className="nav-link user-name">
                  <span className="nav-icon">👤</span>
                  {user?.name}
                </span>
              </li>
              <li className="nav-item">
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  <span className="nav-icon">🚪</span>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-btn">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default UserNavbar;