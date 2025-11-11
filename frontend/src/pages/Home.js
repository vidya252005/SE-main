import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Delicious Food Delivered to Your Door</h1>
          <p>Order from your favorite restaurants and get it delivered fast!</p>
          <Link to="/restaurants" className="cta-button">
            Order Now
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Fast Delivery</h3>
            <p>Get your food delivered in under 30 minutes</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h3>Wide Selection</h3>
            <p>Choose from hundreds of restaurants</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h3>Easy Payment</h3>
            <p>Multiple payment options available</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Quality Food</h3>
            <p>Only the best restaurants on our platform</p>
          </div>
        </div>
      </section>

      <section className="popular-categories">
        <h2>Popular Categories</h2>
        <div className="categories-grid">
          <div className="category-card">🍕 Pizza</div>
          <div className="category-card">🍔 Burgers</div>
          <div className="category-card">🍜 Asian</div>
          <div className="category-card">🥗 Healthy</div>
          <div className="category-card">🍰 Desserts</div>
          <div className="category-card">☕ Beverages</div>
        </div>
      </section>
    </div>
  );
};

export default Home;