import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-header">
          <h1>Welcome to FoodDeliver</h1>
          <p className="landing-subtitle">
            Order food from your favorite restaurants or manage your restaurant business
          </p>
        </div>

        <div className="landing-cards">
          <div className="landing-card">
            <h2>I'm a Customer</h2>
            <p>Order food from amazing restaurants</p>
            <div className="card-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/signup')}
              >
                User Register
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/login')}
              >
                User Login
              </button>
            </div>
          </div>

          <div className="landing-card">
            <h2>I'm a Restaurant</h2>
            <p>Manage your restaurant and orders</p>
            <div className="card-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/restaurant-signup')}
              >
                Restaurant Register
              </button>
              <button 
                className="btn-secondary"
                onClick={() => navigate('/restaurant-login')}
              >
                Restaurant Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;