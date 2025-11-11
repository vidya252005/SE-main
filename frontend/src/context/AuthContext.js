import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'user' | null
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if a USER is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');          // user token
    const savedUser = localStorage.getItem('user');
    const savedRole = localStorage.getItem('role');       // 'user' | 'restaurant'
    if (token && savedUser && savedRole === 'user') {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
      setRole('user');
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', 'user');
    setUser(userData);
    setIsLoggedIn(true);
    setRole('user');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (localStorage.getItem('role') === 'user') {
      localStorage.removeItem('role');
    }
    setUser(null);
    setIsLoggedIn(false);
    setRole(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    role,
    isLoggedIn,
    loading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export default AuthContext;
