import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

export default function RoleRoute({ role, children }) {
  // Extract both user and restaurant login states + loading
  const { isLoggedIn: userIn, role: userRole, loading: userLoading } = useAuth();
  const { isLoggedIn: restIn, loading: restLoading } = useRestaurant();

  // 🧩 Wait until both contexts finish loading before making redirect decisions
  if (userLoading || restLoading) {
    return <div className="loading">Loading...</div>; // optional spinner or null
  }

  // ✅ Protect user routes
  if (role === 'user') {
    if (!userIn || userRole !== 'user') {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // ✅ Protect restaurant routes
  if (role === 'restaurant') {
    if (!restIn) {
      return <Navigate to="/restaurant-login" replace />;
    }
    return children;
  }

  // ✅ Default fallback
  return <Navigate to="/" replace />;
}
