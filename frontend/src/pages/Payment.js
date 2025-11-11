import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';
import './Payment.css';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, restaurant, clearCart, calculateTotal } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [upiId, setUpiId] = useState('');

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [isLoggedIn, cartItems, user, navigate]);

  const handleCardChange = (e) => {
    let value = e.target.value;

    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      value = value.slice(0, 19);
    } else if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    } else if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails({ ...cardDetails, [e.target.name]: value });
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validatePayment = () => {
    // Address validation (common for all)
    if (
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.zipCode
    ) {
      setError('Please fill in all address fields');
      return false;
    }

    // Card validation
    if (paymentMethod === 'card') {
      const cardNum = cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNum.length !== 16) {
        setError('Card number must be 16 digits');
        return false;
      }
      if (!cardDetails.cardName) {
        setError('Cardholder name is required');
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        setError('Expiry date must be in MM/YY format');
        return false;
      }
      if (cardDetails.cvv.length !== 3) {
        setError('CVV must be 3 digits');
        return false;
      }
    }

    // UPI validation
    if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID');
        return false;
      }
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePayment()) return;

    setLoading(true);

    try {
      // Simulate processing delay
      if (paymentMethod !== 'cod') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Create order
      const orderData = {
        user: user.id,
        restaurant: restaurant.id,
        items: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          menuItem: item.id,
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: deliveryAddress,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
        paymentMethod: paymentMethod,
      };

      const order = await orderAPI.create(orderData);
      console.log('Order created:', order);

      clearCart();

      if (paymentMethod === 'cod') {
        alert('Order placed! Please pay on delivery 💵');
      } else {
        alert('Payment successful! Your order has been placed 🎉');
      }

      navigate('/orders');
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  if (cartItems.length === 0) return null;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button onClick={() => navigate('/cart')} className="back-button">
            ← Back to Cart
          </button>
          <h1>Checkout & Payment</h1>
        </div>

        <div className="payment-content">
          <div className="payment-forms">
            {error && <div className="error-message">⚠️ {error}</div>}

            {/* Delivery Address */}
            <div className="form-section">
              <h3>📍 Delivery Address</h3>
              <form className="address-form">
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address *"
                  value={deliveryAddress.street}
                  onChange={handleAddressChange}
                />
                <div className="form-row">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={deliveryAddress.state}
                    onChange={handleAddressChange}
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code *"
                    value={deliveryAddress.zipCode}
                    onChange={handleAddressChange}
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-methods">
                {['card', 'upi', 'cod'].map((method) => (
                  <button
                    key={method}
                    className={`payment-method-btn ${
                      paymentMethod === method ? 'active' : ''
                    }`}
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === 'card'
                      ? '💳 Card'
                      : method === 'upi'
                      ? '📱 UPI'
                      : '💵 Cash on Delivery'}
                  </button>
                ))}
              </div>

              {/* Conditional Payment Forms */}
              {paymentMethod === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={handleCardChange}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleCardChange}
                    />
                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={cardDetails.cvv}
                      onChange={handleCardChange}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="upi-form">
                  <label>Enter UPI ID</label>
                  <input
                    type="text"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="cod-info">
                  <p>💵 You’ll pay in cash when your order is delivered.</p>
                  <p className="cod-note">Please keep the exact amount ready.</p>
                </div>
              )}
            </div>

            {/* Pay or Confirm Button */}
            <button
              className="pay-button"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : paymentMethod === 'cod' ? (
                `Confirm Order`
              ) : (
                `Pay ₹${total.toFixed(2)}`
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="order-summary-sidebar">
            <div className="summary-card">
              <h3>Order Summary</h3>
              {restaurant && (
                <div className="restaurant-info">
                  <strong>{restaurant.name}</strong>
                </div>
              )}
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <strong>Total:</strong>
                <strong>₹{total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="secure-payment">
              🔒 Your payment is 100% secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
