import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import './Cart.css';

function Cart() {
  const {
    cartItems,
    restaurant,
    clearCart,
    updateQuantity,
    removeFromCart,
    calculateSubtotal,
    calculateTax,
    calculateDeliveryFee,
    calculateTotal,
  } = useCart();

  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = () => {
    if (!isLoggedIn) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    navigate('/payment');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-page">
        <div className="cart-empty-content">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items from our restaurants!</p>
          <button
            className="browse-button"
            onClick={() => navigate('/restaurants')}
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Left: Cart Items */}
        <div className="cart-main">
          <h1>🛍️ Your Cart</h1>

          {error && (
            <div className="error-message">
              <span>⚠️ {error}</span>
            </div>
          )}

          {restaurant && (
            <div className="cart-restaurant-info">
              <h3>
                Ordering from: <strong>{restaurant.name}</strong>
              </h3>
            </div>
          )}

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">🍽️</div>
                  )}
                </div>

                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  <p className="item-price">₹{item.price.toFixed(2)} each</p>

                  <div className="quantity-controls">
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-right">
                  <p className="total-price">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="remove-item-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="cart-sidebar">
          <div className="cart-summary">
            <h3>Order Summary</h3>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Tax (8%):</span>
                <span>₹{calculateTax().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Delivery Fee:</span>
                <span>₹{calculateDeliveryFee().toFixed(2)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <strong>Total:</strong>
                <strong>₹{calculateTotal().toFixed(2)}</strong>
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span> Processing...
                </>
              ) : (
                'Proceed to Payment 💳'
              )}
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/restaurants')}
            >
              ← Continue Shopping
            </button>
          </div>

          {isLoggedIn && user && (
            <div className="delivery-info">
              <h4>Delivery Address</h4>
              {user.address ? (
                <p>
                  {user.address.street}
                  <br />
                  {user.address.city}, {user.address.state}{' '}
                  {user.address.zipCode}
                </p>
              ) : (
                <p className="no-address">
                  No address saved. Using default address.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
