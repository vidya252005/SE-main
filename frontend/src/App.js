import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import UserNavbar from './components/UserNavbar';
import RestaurantNavbar from './components/RestaurantNavbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantLogin from './pages/RestaurantLogin';
import RestaurantSignup from './pages/RestaurantSignup';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantMenu from './pages/RestaurantMenu';
import RestaurantOrders from './pages/RestaurantOrders';
import RestaurantProfile from './pages/RestaurantProfile';
import Orders from './pages/Orders';
import Payment from './pages/Payment';
import Feedback from './pages/Feedback';
import RoleRoute from './routes/RoleRoute';
import './App.css';
import Help from './pages/Help';

function NavbarSwitcher() {
  const location = useLocation();
  const path = location.pathname;
  const { role: userRole, isLoggedIn: userLoggedIn } = useAuth();
  const { isLoggedIn: restaurantLoggedIn } = useRestaurant();

  // Hide navbar on auth pages
  if (
    path === '/' ||
    path === '/login' ||
    path === '/signup' ||
    path === '/restaurant-login' ||
    path === '/restaurant-signup'
  ) return null;

  // Prefer role-based navbars
  if (restaurantLoggedIn) return <RestaurantNavbar />;
  if (userLoggedIn && userRole === 'user') return <UserNavbar />;

  // Fallback by path for deep links
  if (path.startsWith('/restaurant/')) return <RestaurantNavbar />;
  return <UserNavbar />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RestaurantProvider>
          <CartProvider>
            <div className="App">
              <NavbarSwitcher />
              <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/restaurant-login" element={<RestaurantLogin />} />
                <Route path="/restaurant-signup" element={<RestaurantSignup />} />

                {/* Restaurant area (protected by role) */}
                <Route
                  path="/restaurant/dashboard"
                  element={<RoleRoute role="restaurant"><RestaurantDashboard /></RoleRoute>}
                />
                <Route
                  path="/restaurant/menu"
                  element={<RoleRoute role="restaurant"><RestaurantMenu /></RoleRoute>}
                />
                <Route
                  path="/restaurant/orders"
                  element={<RoleRoute role="restaurant"><RestaurantOrders /></RoleRoute>}
                />
                <Route
                  path="/restaurant/profile"
                  element={<RoleRoute role="restaurant"><RestaurantProfile /></RoleRoute>}
                />

                {/* User area (protected by role) */}
                <Route path="/orders" element={<RoleRoute role="user"><Orders /></RoleRoute>} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/help" element={<Help />} />
              </Routes>
            </div>
          </CartProvider>
        </RestaurantProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
