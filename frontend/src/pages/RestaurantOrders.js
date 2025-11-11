import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "../context/RestaurantContext";
import "./RestaurantOrders.css";

const RestaurantOrders = () => {
  console.log("✅ Rendering RestaurantOrders");
  const { restaurant, isLoggedIn: isRestaurantLoggedIn } = useRestaurant();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const ORDER_STATUSES = [
    "All",
    "pending",
    "preparing",
    "ready",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    if (!isRestaurantLoggedIn) {
      navigate("/restaurant-login");
      return;
    }
    fetchOrders();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [isRestaurantLoggedIn, navigate]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("restaurantToken");
      const restaurantId = restaurant?._id || restaurant?.id;

      if (!restaurantId) {
        console.warn("⚠️ Restaurant ID not found in context/localStorage");
        setOrders([]);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5001/api/orders/restaurant/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Normalize data to array
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data.data)) {
          setOrders(data.data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          console.warn("Unexpected orders response format:", data);
          setOrders([]);
        }
      } else {
        console.error("❌ Failed to fetch orders:", response.status);
        setOrders([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem("restaurantToken");
    try {
      const response = await fetch(
        `http://localhost:5001/api/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        alert(`Order status updated to ${newStatus}!`);
        fetchOrders();
        setSelectedOrder(null);
      } else {
        alert("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#ffc107";
      case "preparing":
        return "#2196f3";
      case "ready":
        return "#ff9800";
      case "delivered":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
    };
    return statusFlow[currentStatus];
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Safely compute derived values
  const filteredOrders = Array.isArray(orders)
    ? filterStatus === "All"
      ? orders
      : orders.filter((order) => order.status === filterStatus)
    : [];

  const orderCounts = Array.isArray(orders)
    ? {
        all: orders.length,
        pending: orders.filter((o) => o.status === "pending").length,
        preparing: orders.filter((o) => o.status === "preparing").length,
        ready: orders.filter((o) => o.status === "ready").length,
        delivered: orders.filter((o) => o.status === "delivered").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
      }
    : { all: 0, pending: 0, preparing: 0, ready: 0, delivered: 0, cancelled: 0 };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="restaurant-orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <div>
            <h1>Orders Management</h1>
            <p>Manage and track all your restaurant orders</p>
          </div>
          <button className="refresh-btn" onClick={fetchOrders}>
            🔄 Refresh
          </button>
        </div>

        {/* Status Filter */}
        <div className="status-filter">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              className={`filter-btn ${
                filterStatus === status ? "active" : ""
              }`}
              onClick={() => setFilterStatus(status)}
            >
              {status === "All"
                ? `All (${orderCounts.all})`
                : `${status} (${orderCounts[status] || 0})`}
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
          <div className="no-orders">
            <h2>📦 No {filterStatus !== "All" ? filterStatus : ""} orders</h2>
            <p>Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <h3>{order.orderNumber}</h3>
                    <p className="order-time">{formatTime(order.createdAt)}</p>
                  </div>
                  <span
                    className="order-status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="customer-info">
                  <h4>👤 {order.customer?.name || "Customer"}</h4>
                  <p>📞 {order.customer?.phone || "N/A"}</p>
                  <p>📍 {order.customer?.address || "N/A"}</p>
                  {order.deliveryInstructions && (
                    <p className="delivery-note">
                      📝 {order.deliveryInstructions}
                    </p>
                  )}
                </div>

                <div className="order-items-list">
                  <h4>Items:</h4>
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item-row">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <strong>Total: ${order.total?.toFixed(2)}</strong>
                  </div>
                  <div className="order-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View Details
                    </button>
                    {getNextStatus(order.status) && (
                      <button
                        className="update-status-btn"
                        onClick={() =>
                          updateOrderStatus(
                            order._id,
                            getNextStatus(order.status)
                          )
                        }
                      >
                        Mark as {getNextStatus(order.status)}
                      </button>
                    )}
                    {order.status === "pending" && (
                      <button
                        className="cancel-order-btn"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to cancel this order?"
                            )
                          ) {
                            updateOrderStatus(order._id, "cancelled");
                          }
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="modal-content order-details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Order Details - {selectedOrder.orderNumber}</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div className="order-details-content">
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color: getStatusColor(selectedOrder.status),
                      }}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <strong>Placed:</strong>{" "}
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                  <p>
                    <strong>Total:</strong> $
                    {selectedOrder.total?.toFixed(2)}
                  </p>
                </div>

                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <p>
                    <strong>Name:</strong> {selectedOrder.customer?.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrder.customer?.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedOrder.customer?.address}
                  </p>
                  {selectedOrder.deliveryInstructions && (
                    <p>
                      <strong>Special Instructions:</strong>{" "}
                      {selectedOrder.deliveryInstructions}
                    </p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Order Items</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price?.toFixed(2)}</td>
                          <td>
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="detail-actions">
                  {getNextStatus(selectedOrder.status) && (
                    <button
                      className="action-btn primary"
                      onClick={() =>
                        updateOrderStatus(
                          selectedOrder._id,
                          getNextStatus(selectedOrder.status)
                        )
                      }
                    >
                      Mark as {getNextStatus(selectedOrder.status)}
                    </button>
                  )}
                  {selectedOrder.status === "pending" && (
                    <button
                      className="action-btn danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to cancel this order?"
                          )
                        ) {
                          updateOrderStatus(selectedOrder._id, "cancelled");
                        }
                      }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
