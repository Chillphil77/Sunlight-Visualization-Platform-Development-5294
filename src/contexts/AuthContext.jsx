import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('sunviz_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock authentication logic with admin override
    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      plan: email.includes('admin') ? 'admin' : email.includes('pro') ? 'premium' : 'free',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      preferences: {
        temperatureUnit: 'fahrenheit',
        timeFormat: '12h',
        emailNotifications: true,
        weatherAlerts: true
      }
    };

    setUser(mockUser);
    localStorage.setItem('sunviz_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const register = async (name, email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = {
      id: Date.now().toString(),
      email,
      name,
      plan: 'free',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      preferences: {
        temperatureUnit: 'fahrenheit',
        timeFormat: '12h',
        emailNotifications: true,
        weatherAlerts: true
      }
    };

    setUser(mockUser);
    localStorage.setItem('sunviz_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sunviz_user');
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('sunviz_user', JSON.stringify(updatedUser));
  };

  // Admin override for pro features
  const hasProAccess = () => {
    return user?.plan === 'premium' || user?.plan === 'admin' || user?.plan === 'enterprise';
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isPremium: hasProAccess(),
    isAdmin: user?.plan === 'admin',
    hasProAccess,
    // Temperature unit preference
    temperatureUnit: user?.preferences?.temperatureUnit || 'fahrenheit'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};